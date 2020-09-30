import { Mutex, MutexInterface } from 'async-mutex'
import { Connection, ConnectionManager, ConnectionOptions, EntityManager, QueryRunner } from 'typeorm'
import { Driver } from 'typeorm/driver/Driver'
import { DriverFactory } from 'typeorm/driver/DriverFactory'
import { SqliteDriver } from 'typeorm/driver/sqlite/SqliteDriver'
import { SqliteQueryRunner } from 'typeorm/driver/sqlite/SqliteQueryRunner'
import { AlreadyHasActiveConnectionError } from 'typeorm/error/AlreadyHasActiveConnectionError'
import { QueryRunnerProviderAlreadyReleasedError } from 'typeorm/error/QueryRunnerProviderAlreadyReleasedError'
import { Logger } from '@nestjs/common'
import { IsolationLevel } from 'typeorm/driver/types/IsolationLevel'


const mutex = new Mutex()

class SqliteQueryRunnerPatched extends SqliteQueryRunner {
  private _releaseMutex: MutexInterface.Releaser | null
  async startTransaction (): Promise<void> {
    //Logger.debug('SqliteQueryRunnerPatched.startTransaction')
    this._releaseMutex = await mutex.acquire()
   // Logger.debug('SqliteQueryRunnerPatched.startTransaction -> acquired mutex')
    return super.startTransaction()
  }

  async commitTransaction (): Promise<void> {
    //Logger.debug('SqliteQueryRunnerPatched.commitTransaction')
    if (!this._releaseMutex) {
      throw new Error('SqliteQueryRunnerPatched.commitTransaction -> mutex releaser unknown')
    }
    await super.commitTransaction()
    this._releaseMutex()
    this._releaseMutex = null
    //Logger.debug('SqliteQueryRunnerPatched.commitTransaction -> released mutex')
  }

  async rollbackTransaction (): Promise<void> {
    //Logger.debug('SqliteQueryRunnerPatched.rollbackTransaction')
    if (!this._releaseMutex) {
      throw new Error('SqliteQueryRunnerPatched.rollbackTransaction -> mutex releaser unknown')
    }
    await super.rollbackTransaction()
    this._releaseMutex()
    this._releaseMutex = null
    //Logger.debug('SqliteQueryRunnerPatched.rollbackTransaction -> released mutex')
  }

  async connect (): Promise<any> {
    //Logger.debug('SqliteQueryRunnerPatched.connect')
    if (!this.isTransactionActive) {
      //Logger.debug('SqliteQueryRunnerPatched.connect -> wait for a lock to be released')
      const release = await mutex.acquire()
      release()
      //Logger.debug('SqliteQueryRunnerPatched.connect -> lock is released')
    }
    return super.connect()
  }
}

class SqliteDriverPatched extends SqliteDriver {
  createQueryRunner (mode: 'master' | 'slave' = 'master'): QueryRunner {
    if (mode === 'slave') {
      return new SqliteQueryRunnerPatched(this)
    }
    if (!this.queryRunner) {
      this.queryRunner = new SqliteQueryRunnerPatched(this)
    }
    return this.queryRunner
  }
}

class DriverFactoryPatched extends DriverFactory {
  create (connection: Connection): Driver {
    const type = connection.options.type
    if (type === 'sqlite') {
      return new SqliteDriverPatched(connection)
    }
    return super.create(connection)
  }
}

class ConnectionPatched extends Connection {
  constructor (connectionOptions: ConnectionOptions) {
    super(connectionOptions)
    const that = this as any
    that.driver = new DriverFactoryPatched().create(this)
  }
}

export const monkeypatch = () => {
  ConnectionManager.prototype.create = function (options: ConnectionOptions): Connection {
    const that = this as any
    const existConnection = that.connections.find((conn: any) => conn.name === (options.name || 'default'))
    if (existConnection) {
      // if connection is registered and its not closed then throw an error
      if (existConnection.isConnected) {
        throw new AlreadyHasActiveConnectionError(options.name || 'default')
      }

      // if its registered but closed then simply remove it from the manager
      that.connections.splice(that.connections.indexOf(existConnection), 1)
    }

    // create a new connection
    const connection = new ConnectionPatched(options)
    that.connections.push(connection)
    return connection
  }
  // tslint: disable-next-line
  EntityManager.prototype.transaction = async function <T> (
    isolationLevel: IsolationLevel, runInTransaction: (entityManager: EntityManager) => Promise<T>
  ): Promise<T> {

    if(typeof isolationLevel !== "string") // deal with overloading
    {
      runInTransaction = isolationLevel;
    }

    if (this.queryRunner && this.queryRunner.isReleased) {
      throw new QueryRunnerProviderAlreadyReleasedError()
    }

    if (this.queryRunner && this.queryRunner.isTransactionActive) {
      throw new Error(`Cannot start transaction because its already started`)
    }

    const queryRunner = this.connection.createQueryRunner('slave')

    try {
      await queryRunner.startTransaction()
      const result = await runInTransaction(queryRunner.manager)
      await queryRunner.commitTransaction()
      return result
    } catch (err) {
      try { // we throw original error even if rollback thrown an error
        await queryRunner.rollbackTransaction()
      // tslint: disable-next-line
      } catch (rollbackError) {
        // tslint: disable-next-line
      }
      throw err
    } finally {
      await queryRunner.release()
    }
  } as any;
}
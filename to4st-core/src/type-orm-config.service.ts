/* istanbul ignore file */
import { Injectable, Logger } from "@nestjs/common";
import { TypeOrmOptionsFactory, TypeOrmModuleOptions } from "@nestjs/typeorm";
import { ConfigService } from "@nestjs/config";

import { monkeypatch as monkeyPostgres } from './libs/db/pg-utc-timestamp-monkey-patch';
import { monkeypatch as monkeySQLite } from './libs/db/sqlite-concurrent-transtactions-monkey-patch';

/**
 * Generates TypeORM config
 */
@Injectable()
export class TypeOrmConfigService implements TypeOrmOptionsFactory {

    constructor(private readonly configService: ConfigService)
    {
    }
    
    /**
     * Create TypeOrm config based on env variables
     */
    createTypeOrmOptions(): TypeOrmModuleOptions 
    {
        const db = this.configService.get<string>("database.type").trim().toLowerCase();

        process.env.TZ = "UTC" // Just in case pg

        if(db === "sqlite")
        {
            monkeySQLite(); // patch sqlite to allow concurrent transactions (by using a mutex)
            Logger.log("Using database: " + db, "TypeOrmConfig");
            return {
            type: "sqlite",
            autoLoadEntities: true,
            migrationsRun: true,
            database: this.configService.get<string>("database.sqlitepath"),
            synchronize: false,
            migrations: [__dirname + '/migrations/sqlite/**/*{.ts,.js}'],
            };
        }
        else if(db === "mysql")
        {
            Logger.log("Using database: " + db, "TypeOrmConfig");
            return {
            type: "mysql",
            autoLoadEntities: true,
            migrationsRun: true,
            host: this.configService.get<string>("database.host"),
            username: this.configService.get<string>("database.username"),
            password: this.configService.get<string>("database.password"),
            database: this.configService.get<string>("database.database"),
            port: this.configService.get<number>("database.port"),
            synchronize: false, 
            timezone: "utc",
            migrations: [__dirname + '/migrations/mysql/**/*{.ts,.js}'],
            };
        }
        else if(db === "postgres")
        {
            monkeyPostgres();
            Logger.log("Using database: " + db, "TypeOrmConfig");
            return {
            type: "postgres",
            autoLoadEntities: true,
            migrationsRun: true,
            host: this.configService.get<string>("database.host"),
            username: this.configService.get<string>("database.username"),
            password: this.configService.get<string>("database.password"),
            database: this.configService.get<string>("database.database"),
            port: this.configService.get<number>("database.port"),
            synchronize: false, 
            migrations: [__dirname + '/migrations/postgres/**/*{.ts,.js}'],
            };
        }
        
        throw new Error(`Database not supported: <${db}>`);
    }
}
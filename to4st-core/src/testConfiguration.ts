/* istanbul ignore file */
export default () => ({
    port: parseInt(process.env.PORT, 10) || 3000,
    forceResetPassword: !!process.env.RESET_PASSWORD,
    instanceId: process.env.INSTANCE_ID ?? "default",
    database: {
        type: process.env.DATABASE_TYPE ?? process.env.TEST_DB ?? "sqlite",
        database: process.env.DATABASE ?? "to4st",
        sqlitepath: process.env.SQLITE_PATH ?? "./../sqlite/testdb-core.sqlite",
        host: process.env.DATABASE_HOST ?? "127.0.0.1",
        ip: process.env.IP ?? "0.0.0.0",
        port: parseInt(process.env.DATABASE_PORT, 10) || 5432,
        username: process.env.DATABASE_USERNAME ?? "defaultUser",
        password: process.env.DATABASE_PASSWORD ?? "defaultPassword",
    }
  });

## Running the app

```bash
# development
$ yarn start

# watch mode
$ yarn start:dev

# production mode
$ yarn start:prod
```

## Building

```bash
# build
$ yarn build

```

## Test

```bash
# integration tests
$ yarn test

# e2e tests
$ yarn test:e2e

# test coverage
$ yarn test:cov
```
The test database configurations are specified in src/testUtils.ts.  
By default SQLite is used for testing. You can test MySQL / Postgres by adding the desired database as env variable.
To test the Steam-User service you need a Steam API Key. You can either assign it in src/globals.ts or using an env variable.

```bash
$ STEAM_API_KEY_OVERRIDE=NeverShareYourSteamAPIKey TEST_DB=postgres yarn test

```

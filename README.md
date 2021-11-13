# TO4ST-core
## WORK IN PROGRESS!
If you find a bug feel free to write an issue or contact me.
If you have a feature request feel free to join the [Tactical Operations discord server](https://discord.gg/TO4) and discuss it there.  

This repository includes the sourcecode (incl. some tests) for TO4ServerTools-core.  
The software serves a backend API for TO4 gameservers which currently offers a banlist, player-/gamestatistics and registered player / mod / admin management.   
Backends can receive a masterserver key that allows TacByte to access the game/player stats in order to generate global statistics.  
A backend can have a list of partner backends which are also queried when a game server looks up a ban for a player. Those backends have to enable 'public bancheck' in the configuration in that case.  

## Developing
Using Visual Studio Code on Linux / Windows with WSL is recommended.  
Node 14 LTS is required. Using [nvm to install](https://github.com/nvm-sh/nvm) is recommended.  
You also need to [install the package manager yarn](https://yarnpkg.com/getting-started/install).  

## Deploying
The preferred way of deploying is Docker. You can find some "EZ preset" docker-compose files in the docker-compose folder.  
[The TO4ST-core image is available on dockerhub.](https://hub.docker.com/r/th120/to4st-core)  
The alternative to docker right now is cloning the repo and using the builded version with tools like pm2.

### ENV Variables
- PORT  
The port which is used by the application
- IP  
IP the server binds to; optional.
- RESET_PASSWORD  
Resets the password by generating a new one or loading a default password
- INIT_PASSWORD
Default password that is used on first start or when no new password is assigned. If undefined a random password is generated and logged.
- INSTANCE_ID  
You can start some instances which use the same database in general, but each one has a different configuration.  
Two instance ids can be used to host one instance of the backend which allows public access to player stats / ban queries and a private one just for gameservers.
- DATABASE_TYPE  
You can use either 'sqlite', 'mysql' or 'postgres'. 
- DATABASE  
Name of the database that is used by the application
- DATABASE_HOST  
Address of MySQL, Postgres Server if used
- DATABASE_PORT  
Port of the database
- DATABASE_USERNAME  
MySQL or Postgres username
- DATABASE_PASSWORD  
Password for MySQL / Postgres database
- SQLITE_PATH  
The path to the SQLite database if used

## Getting started
When an instance, which is using an unused instance id, is started for the first time it is initialized with a random password which is logged or with a default password that has been set in the environment.  
The software will use a different random or the default password on every start until a new password is assigned in the UI.        

In order to use the software with your gameservers you need to generate an auth key for each server which has to be done using the "Gameservers" settings page. The auth key and the address of the backend has to be added to the TO4cfg.ini which is located in the root dir of the gameserver package.

```
TO4STCoreAddress=https:to4st.your-domain.com
TO4STAuthKey=YourUniqueAuthKey
```  
The URL format is not a mistake, if your backend does not use https your entry might look like this: 
```
TO4STCoreAddress=http:123.123.123.123:5000
```    
If you want to use the data the backend collects in other applications you can create API keys using the TO4ST settings page.  
When you query the API you need to assign that key to the Authorization header like this
```
AuthKey ThisIsAnApiKey
```    
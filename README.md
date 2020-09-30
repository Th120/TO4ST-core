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
Node 12 LTS is required. Using [nvm to install](https://github.com/nvm-sh/nvm) is recommended.  
You also need to [install the package manager yarn](https://yarnpkg.com/getting-started/install).  

## Deploying
The preferred way of deploying is Docker. You can find some "EZ preset" docker-compose files in the docker-compose folder.  
[The TO4ST-core image is available on dockerhub.](https://hub.docker.com/r/th120/to4st-core)  
The alternative to docker right now is cloning the repo and using the builded version with tools like pm2.

### First run
When an instance using an unused instance id is started it is initialized with a random password which is logged.  
The software will use a different random password on every start until a new password is assigned in the UI. 

### ENV Variables
- PORT  
The port which is used by the application
- RESET_PASSWORD  
Resets the password and logs a new random password
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

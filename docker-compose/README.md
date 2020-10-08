## Docker Compose  
You need install Docker incl. Docker Compose to use the preset files.  
Keep in mind these are only 'preset' configs that don't apply to all environments. Feel free to edit the files.  
If you need an UI for Docker I can recommend [portainer](https://www.portainer.io/installation/).  
Make sure that the 'web' networks exists before you run the docker-compose command.  
Copy the content of the preset folder you want to use to the path you want to use for the stack.  
Both expose the Postgres container to the web to allow a conncection using pgadmin. If you don't need to access your database it is recommended to add another internal docker network just for TO4ST-core and Postgres.  
### TO4ST-core with domain
Port 80 and 443 have to be free if you want to use this file.  
It automatically generates SSL/TLS certificates for the backend and 
Launch it with: 
```bash
SSL_MAIL=Your@mail-address.com TO4ST_CORE_DOMAIN=YourDomain.com PG_PASS=ASafePasswordForYourDatabase docker-compose up -d
```

### TO4ST-core minimum
The file is currently pre-configured to use port 5012. It is recommended to use a reverse proxy to enable gzip compression.  
Launch it with: 
```bash
PG_PASS=ASafePasswordForYourDatabase docker-compose up -d
```

### Updating
Updating is pretty straight forward if you use docker-compose. First you have to navigate to the directory you use for your stack.  
To update to a newer version you have two possible workflows:  
1. You can specify the target version explicitly in the docker-compose file before updating ([you can find the latest version on Dockerhub](https://hub.docker.com/r/th120/to4st-core/tags)).  
    Example:
    ```
    image: th120/to4st-core:0.1.2
    ```
    In that case you just have to run the command
    ```bash
    docker-compose down
    ```
    After it has finished just run the "docker-compose up"-command from above again, it download the new version you specified in the docker-compose file.  

2. If you just keep it like it is ("latest") you have to run the command 
    ```bash
    docker-compose down
    ```
    Before you run the "docker-compose up"-command you have to delete the local docker image of TO4ST-core.
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
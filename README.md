# deploy


```
Make update
```

- ``` git pull origin master ```
- ``` docker-compose stop ``` 
- ``` make build ```
- ``` docker-compose up -d ```


## Database sync 

```
docker stop <id>
``` 

```
bash syncRemoteDbtoLocal.sh
```
 
```
make runprod  
```
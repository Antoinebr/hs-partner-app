# deploy


connct to : sshOvh2

- send everything to GitHub

On the server : 

```
Make update
```

- ``` git pull origin master ```
- ``` docker-compose stop ``` 
- ``` make build ```
- ``` docker-compose up -d ```
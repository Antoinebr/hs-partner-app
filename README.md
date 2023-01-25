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


### ServiceHub 

It's possible to identify the connected user by sending his email address to the HubSpot API and get a token back : 
https://developers.hubspot.com/docs/api/conversation/visitor-identification
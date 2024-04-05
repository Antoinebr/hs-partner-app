build:
	docker build -t antoine/partner-app . --force-rm;

run:
	docker run -d -p 3001:3001 -it antoine/partner-app

# Stops the first contianer found with the name 'antoine/partner-app'
stop:
	docker stop $(docker ps -q -f ancestor='antoine/partner-app' | head -n 1)

runprod:
	docker run -d -p 3001:3001 -it -v  $(shell pwd)/db/db.sqlite:/app/db/db.sqlite  antoine/partner-app	

update:
	bash ./dbSync.sh
	git pull origin master
	forever restart server.js


 
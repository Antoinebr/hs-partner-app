build:
	docker build -t antoine/partner-app . --force-rm;

run:
	docker run -d -p 3001:3001 -it antoine/partner-app

update:
	bash ./dbSync.sh
	git pull origin master
	forever restart server.js

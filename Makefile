build:
	docker build -t antoine/partner-app . --force-rm;

run:
	docker run -d -p 3081:8080 -it antoine/partner-app

dbsync:
	bash dbsync.sh

update:
	bash dbsync.sh
	git pull origin master
	forever restart server.js

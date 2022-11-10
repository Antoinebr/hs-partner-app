build:
	docker build -t antoine/partner-app . --force-rm;

run:
	docker run -d -p 3081:8080 -it antoine/partner-app

update:
	git pull origin master
	docker-compose stop
	make build
	docker-compose up -d

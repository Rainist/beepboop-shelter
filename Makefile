.PHONY: run ngrok down debug build test
run:
	docker-compose up
build:
	docker-compose build
ngrok:
	docker-compose -f docker-compose.ngrok.yml run --service-ports ngrok
down:
	docker-compose -f docker-compose.yml -f docker-compose.ngrok.yml down
debug:
	docker-compose run -e DEBUG=express:* --service-ports node
test:
	docker-compose run node npm test

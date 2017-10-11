.PHONY: run ngrok down debug build test
run:
	docker-compose up
build:
	docker-compose build
# ngrok:
# 	docker-compose -f docker-compose.yml -f docker-compose.ngrok.yml run ngrok
down:
	docker-compose -f docker-compose.yml -f docker-compose.ngrok.yml down
# debug:
# 	docker-compose run --service-ports node bash -c "npm install && npm run watch-debug"
# test:
# 	docker-compose run node npm test

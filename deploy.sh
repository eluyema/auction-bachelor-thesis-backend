docker stop backend
docker rm backend
docker image rm hdanylo/auction-backend
docker pull hdanylo/auction-backend
docker run -p 3000:3000 --name backend -d --env-file ./env hdanylo/auction-backend

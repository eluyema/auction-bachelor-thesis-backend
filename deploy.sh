docker pull hdanylo/auction-backend
docker run -p 3000:3000 -e DATABASE_URL={{DATABASE_URL}} -e TOKEN_SECRET={{TOKEN_SECRET}} -e TOKEN_EXPIRES_IN={{TOKEN_EXPIRES_IN}} hdanylo/auction-backend

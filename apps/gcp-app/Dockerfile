FROM node:18-slim

WORKDIR /app
COPY . .
RUN apt-get update && apt-get install -y curl
RUN yarn install --production=true

CMD ["yarn", "start"]

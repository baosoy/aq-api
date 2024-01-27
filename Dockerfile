
FROM node:20-alpine
RUN mkdir -p /app
WORKDIR /app

COPY package.json  .
COPY yarn.lock .
RUN yarn install
COPY . .



EXPOSE 80
CMD [ "yarn", "run", "start" ]
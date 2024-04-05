FROM arm64v8/node:16-alpine


WORKDIR /app
COPY . .

# If you have native dependencies, you'll need extra tools
# RUN apk add --no-cache make gcc g++ python

RUN apk update && apk upgrade
RUN apk add --no-cache sqlite

RUN apk add curl

RUN npm install
RUN npm rebuild

EXPOSE 3001

CMD [ "node", "/app/server.js" ]
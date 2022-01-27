FROM mhart/alpine-node

WORKDIR /app
COPY . .

# If you have native dependencies, you'll need extra tools
# RUN apk add --no-cache make gcc g++ python

RUN apk add curl

RUN npm install

EXPOSE 3000
CMD ["node", "server.js"]

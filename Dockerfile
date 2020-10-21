FROM node:10.19.0-alpine3.9

RUN mkdir /var/lib/aion
WORKDIR /var/lib/aion

COPY . .
RUN sed -i "s/path.join(\"\/home\", username, device_symbol)/\"\/data\"/g" ./src/main.ts
RUN sed -i "s/localhost/mysql/g" ./mysql-config.json

# install and cache app dependencies
RUN yarn install --production

# start app
CMD ["yarn", "start"]

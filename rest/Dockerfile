# Dockerfile for Express.js rest API with sqlite

FROM node:alpine

RUN ["apk", "update"]
RUN ["apk", "upgrade"]

RUN ["apk", "add", "--virtual", "sqlite", "python", "builds-deps", "build-base" ]

WORKDIR /app
COPY *.json /app/

#RUN ["npm", "rebuild", "bcrypt", "--build-from-source"]
RUN ["npm", "install"]

COPY rest/app.js /app/app.js
EXPOSE 1337
CMD node app.js



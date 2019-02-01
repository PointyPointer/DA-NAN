# Dockerfile for Express.js rest API with sqlite

FROM node:alpine

RUN ["apk", "update"]
RUN ["apk", "upgrade"]
Run ["apk","add","--update","python","sqlite","make","g++"]

WORKDIR /app
COPY rest/*.json /app/

RUN ["npm", "install"]

COPY rest/app.js /app/app.js
EXPOSE 1337
CMD node app.js



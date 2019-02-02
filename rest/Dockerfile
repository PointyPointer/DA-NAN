# Dockerfile for Express.js rest API with sqlite

FROM node:alpine

RUN ["apk", "update"]
RUN ["apk", "upgrade"]
RUN ["apk", "add", "--no-cache", "sqlite", "python", "build-base","make","g++" ]

WORKDIR /app
COPY *.json /app/

#RUN ["npm", "rebuild", "bcrypt", "--build-from-source"]
RUN ["npm", "install"]

COPY app.js /app/app.js
EXPOSE 1337
CMD node app.js



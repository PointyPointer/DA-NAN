# Dockerfile for Express.js rest API with sqlite

FROM node:alpine

RUN ["apk", "run", "--update", "sqlite"]



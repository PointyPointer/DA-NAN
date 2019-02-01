#/bin/bash

gcc --static -o milestone1/static_web milestone1/milestone1.c
docker build -f milestone1/Dockerfile -t milestone1 .
docker run --name "milestone1" -p 80:80 milestone1

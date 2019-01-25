#/bin/bash

gcc --static -o static_web milestone1.c
docker build -t webby .
docker run -p 80:80 webby

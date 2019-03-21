#!/bin/bash
docker kill web apache rest 
docker rm web apache rest

gcc --static -o c/bin/web c/web.c

touch error.log access.log
docker build -f c/Dockerfile -t c ./c
docker build -f apache/Dockerfile -t apache ./apache/
docker build -f express/Dockerfile -t express ./express
rm error.log access.log

docker run -d --cap-drop ALL --cap-add NET_BIND_SERVICE --cap-add SETGID --cap-add SETUID --cap-add SYS_CHROOT --mount type=volume,src=log,dst=/var/log/ --cpu-shares=50 --name "web" -p 80:80 c

docker run -d --name "apache" -p 8080:80 apache

docker run -d --mount type=bind,src=$(pwd)/express/db,dst=/db --name "rest" -p 1337:1337 express

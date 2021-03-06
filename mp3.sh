#!/bin/bash
docker kill mp3_web mp3_alpine
docker rm mp3_web mp3_alpine

gcc --static -o milestone3/etc/web milestone3/milestone3.c

touch error.log access.log
docker build -f milestone3/server.dockerfile -t mp3_web .
docker build -f milestone3/alpine.dockerfile -t mp3_alpine .
rm -f error.log access.log

docker run -d --cap-drop ALL --cap-add NET_BIND_SERVICE --cap-add SETGID --cap-add SETUID --cap-add SYS_CHROOT --mount type=volume,src=log,dst=/var/log/ --cpu-shares=50 --name "mp3_web" -p 80:80 mp3_web
docker run -d --name "mp3_alpine" -p 8080:80 mp3_alpine

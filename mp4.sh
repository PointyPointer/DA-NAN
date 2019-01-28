#!/bin/bash
docker kill mp4_web mp4_alpine mp4_rest
docker rm mp4_web mp4_alpine mp4_rest


gcc --static -o web/etc/web web/web.c

touch error.log web/access.log
docker build -f web/server.dockerfile -t mp4_web .
docker build -f cgi/alpine.dockerfile -t mp4_alpine .
docker build -f rest/rest.dockerfile -t mp4_rest .
rm -f error.log web/access.log

docker run -d --cap-drop ALL --cap-add NET_BIND_SERVICE --cap-add SETGID --cap-add SETUID --cap-add SYS_CHROOT --mount type=volume,src=log,dst=/var/log/ --cpu-shares=50 --name "mp4_web" -p 80:80 web

docker run -d --name "mp4_alpine" -p 8080:80 mp4_alpine

docker run -d --mount type=bind,src=$(pwd)/rest/db,dst=/db --name "mp4_rest" -p 1337:1337 mp4_rest

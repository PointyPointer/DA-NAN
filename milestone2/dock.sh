#!/bin/bash

gcc --static -o etc/web milestone2.c
touch error.log access.log
docker build -f server -t web .
rm -f error.log access.log

docker run -d --cap-drop ALL --cap-add NET_BIND_SERVICE --cap-add SETGID --cap-add SETUID --cap-add SYS_CHROOT --mount type=volume,src=log,dst=/var/log/ --cpu-shares=50 --name "web" -p 80:80 web

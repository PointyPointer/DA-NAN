#!/bin/bash

gcc --static -o etc/web milestone2.c
touch error.log
docker build -f server -t web .
rm -f error.log

docker run -d --cap-drop ALL --cap-add NET_BIND_SERVICE --cap-add SETGID --cap-add SETUID --cap-add SYS_CHROOT -v log_volum:/var/log --cpu-shares=50 --name "web" -p 80:80 web

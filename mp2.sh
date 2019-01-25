#!/bin/bash

gcc --static -o milestone2/etc/web milestone2/milestone2.c
touch error.log milestone2/access.log
docker build -f milestone2/server -t milestone2 .
rm -f error.log milestone2/access.log

docker run -d --cap-drop ALL --cap-add NET_BIND_SERVICE --cap-add SETGID --cap-add SETUID --cap-add SYS_CHROOT --mount type=volume,src=log,dst=/var/log/ --cpu-shares=50 --name "web" -p 80:80 milestone2

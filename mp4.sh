#!/bin/bash

gcc --static -o web/etc/web web/web.c

touch error.log web/access.log
docker build -f web/server.dockerfile -t web .
docker build -f cgi/alpine.dockerfile -t alpine .
docker build -f rest/rest.dockerfile -t rest .
rm -f error.log web/access.log

docker run -d --cap-drop ALL --cap-add NET_BIND_SERVICE --cap-add SETGID --cap-add SETUID --cap-add SYS_CHROOT --mount type=volume,src=log,dst=/var/log/ --cpu-shares=50 --name "web" -p 80:80 web

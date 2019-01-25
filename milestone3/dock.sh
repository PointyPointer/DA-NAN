#!/bin/bash
docker kill web; docker rm web;
docker kill cgi; docker rm cgi;

gcc --static -o etc/web milestone3.c

touch error.log access.log
docker build -f server.dockerfile -t web .
docker build -f alpine.dockerfile -t cgi .
rm -f error.log access.log

docker run -d --cap-drop ALL --cap-add NET_BIND_SERVICE --cap-add SETGID --cap-add SETUID --cap-add SYS_CHROOT --mount type=volume,src=log,dst=/var/log/ --cpu-shares=20 --name "web" -p 80:80 web
docker run -d  --name "cgi" -p 8080:80 cgi

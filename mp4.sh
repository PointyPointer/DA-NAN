#!/bin/bash

gcc --static -o web/etc/web web/web.c

touch error.log web/access.log
docker build -f web/server.dockerfile -t web .
docker build -f cgi/alpine.dockerfile -t alpine .
docker build -f rest/rest.dockerfile -t rest .
rm -f error.log web/access.log

docker run  --mount type=volume,src=log,dst=/var/log/ --cpu-shares=15 --name "rest" -p "1337:1337" rest

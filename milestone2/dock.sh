#/bin/bash

gcc --static -o web milestone2.c
touch error.log
docker build -t webby .
rm -f error.log

docker run -d --cap-drop ALL --cap-add NET_BIND_SERVICE --cap-add SETGID --cap-add SETUID --cpu-shares=50 -p 80:80 webby

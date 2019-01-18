#/bin/bash

gcc --static -o web milestone2.c
docker build -t webby .

sudo systemctl stop docker
sudo dockerd --userns-remap=$1 &

docker run -d --cap-drop ALL --cap-add NET_BIND_SERVICE --cap-add SETGID --cap-add SETUID --cpu-shares=50 -p 80:80 webby

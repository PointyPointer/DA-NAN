#/bin/bash
sudo systemctl stop docker
sudo dockerd --userns-remap=$1 > /dev/null 2>&1 &

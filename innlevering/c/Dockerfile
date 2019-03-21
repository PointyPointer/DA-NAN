#Dockerfile for the server

FROM scratch

COPY bin/* /bin/
COPY etc/* /etc/
COPY www/* /var/www/

EXPOSE 80
CMD ["/bin/dumb-init","/bin/web"]


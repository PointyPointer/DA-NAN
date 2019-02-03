#Dockerfile for the server

FROM scratch

COPY etc/* /etc/
COPY www/* /var/www/

EXPOSE 80
CMD ["/etc/dumb-init","/etc/web"]


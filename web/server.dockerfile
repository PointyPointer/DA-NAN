#Dockerfile for the server

FROM scratch

COPY web/etc/* /etc/
COPY web/www/* /var/www/

COPY error.log /var/log/web_error.log
COPY access.log /var/log/web_access.log

EXPOSE 80
CMD ["/etc/dumb-init","/etc/web"]


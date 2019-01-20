FROM scratch

COPY web /etc/web
COPY dumb-init /etc/dumb-init
COPY mime.types /etc/mime.types

COPY www/test.asis /var/www/
COPY error.log /var/log/web_error.log

EXPOSE 80

CMD ["/etc/dumb-init","/etc/web"]

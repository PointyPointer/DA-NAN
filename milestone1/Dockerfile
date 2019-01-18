FROM scratch

COPY web /web
COPY dumb-init /dumb-init

COPY test.asis /var/www/test.asis
COPY error.log /var/log/web_error.log

EXPOSE 80

CMD ["/dumb-init","/web"]

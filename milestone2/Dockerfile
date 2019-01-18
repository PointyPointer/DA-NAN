FROM scratch

COPY web /web
COPY dumb-init /dumb-init

COPY www/* /var/www/
COPY error.log /var/log/web_error.log

EXPOSE 80

CMD ["/dumb-init","/web"]

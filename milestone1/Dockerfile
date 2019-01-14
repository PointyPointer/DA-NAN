FROM scratch
COPY static_web /web
COPY test.asis /var/www/test.asis
COPY error.log /var/log/web_error.log
EXPOSE 80
CMD ["/web"]

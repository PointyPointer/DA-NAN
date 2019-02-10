# Dockerfile for the alpine server

FROM httpd:alpine
RUN ["apk", "add", "python3"]

EXPOSE 80
RUN /bin/rm /usr/local/apache2/cgi-bin/*
# COPY cgi/* /usr/local/apache2/cgi-bin/
COPY http.conf /usr/local/apache2/conf/httpd.conf


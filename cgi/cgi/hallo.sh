#!/bin/sh

echo "Set-Cookie:kake1=mm; path=/"
echo "Content-Type: text/plain	; charset=utf-8"
echo
echo "Hallo cgi"
echo "HTTP_COOKIE: $HTTP_COOKIE"
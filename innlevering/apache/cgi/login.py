#!/usr/bin/python3
import cgi
import os
import requests
import cgitb
import re
import sys
from os import environ
cgitb.enable()



form = cgi.FieldStorage()
BrukerNavn = form.getvalue('BNavn')
Passord = form.getvalue('Pord')
LoggUt = form.getvalue('LoggUt')
cookie = False

cookies = {}
if ('HTTP_COOKIE' in environ):
   for cookie in environ['HTTP_COOKIE'].split(';'):
      if '=' in cookie:
        (key, value ) = cookie.strip().split('=')
        cookies[key] = value

if environ['REQUEST_METHOD']=='POST':
    if 'LoggInn' in form:
        xml=f'<user><username>{BrukerNavn}</username><password>{Passord}</password></user>'
        r = requests.post('http://rest:1337/login', data=xml, headers= {'content-type':'text/xml; charset=utf8', })
        if 'Set-Cookie' in r.headers:
            cookie = r.headers['Set-Cookie'].split(', username=')
            cookie[1] = 'username=' + cookie[1]
    elif 'LoggUt' in form:
        r = requests.delete('http://rest:1337/logout', cookies=cookies)
        if 'Set-Cookie' in r.headers:
            cookie = r.headers['Set-Cookie'].split(', username=')
            cookie[1] = 'username=0 ' + cookie[1]
            # cookie[0] = cookie[0].replace('sessionID=', 'sessionID=0 ')

if cookie:
    for c in cookie:
        print("Set-cookie: "+ c, file=sys.stderr)
        print ('Set-cookie: ' + c + ';')

    
print ('Content-Type: text/html; charset=utf-8\n')
print ()


print('<!DOCTYPE html>')
print('<html>')
print('<head>')
print('<title>Login</title>')
print('</head>')
print('<body>')
print('<form method="POST">BrukerNavn: <input type = "text" name = "BNavn" id = "BNavn"> <br>')
print('Pass: <input type="password" name="Pord" id="Pord">')
print('<input type="submit" value = "Logg inn" name="LoggInn" id="LoggInn">')
print('</form>')
print('<form method="POST"> <input type="submit" value = "Logg ut" name = "LoggUt" id = "LoggUt" ></form>')
print('</body>')
print('</html>')

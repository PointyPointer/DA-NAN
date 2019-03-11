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

if environ['REQUEST_METHOD']=='POST':
    if 'LoggInn' in form:
        xml=f'<user><username>{BrukerNavn}</username><password>{Passord}</password></user>'
        r = requests.post('http://rest:1337/login', data=xml, headers= {'content-type':'text/xml; charset=utf8', })
        if 'Set-Cookie' in r.headers:
            cookie = r.headers['Set-Cookie'].split(', username=')
            cookie[1] = 'username=' + cookie[1]
    elif 'LoggUt' in form:
        r = requests.delete('http://rest:1337/logout')
        if 'Set-Cookie' in r.headers:
            cookie = r.headers['Set-Cookie'].split(', username=')
            cookie[1] = 'username=' + cookie[1]

if cookie:
    for c in cookie:
        print ('Set-cookie:', c)

    
print ('Content-Type: text/html; charset=utf-8\n')
print ()


with open('../html/login.html') as f:
    print (''.join ([a for a in f]))
    

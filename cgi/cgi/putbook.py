#!/usr/bin/python3
import cgi
import os
import requests
import cgitb
import re
from os import environ
cgitb.enable()

print ('Content-Type: text/html; charset=utf-8\n')
print ()
print ('<HTML>')
print ('<HEAD><TITLE>Endre Bok</TITLE></HEAD>')
print ('<BODY>')

print( '<br>'.join([f'<a href="{f}">{f}</a>' for f in os.listdir() if f.endswith('.py')]) + '<BR>' )
session_id=False
if ('HTTP_COOKIE' in environ):
   for cookie in environ['HTTP_COOKIE'].split(';'):
      (key, value ) = cookie.strip().split('=')
      print(key,value)
      if key == "sessionID":
         session_id = value


sokBok = requests.get("http://rest:1337/bok/")
print (sokBok.text)



print ("</BODY></HTML>")

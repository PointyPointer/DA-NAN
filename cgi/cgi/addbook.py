#!/usr/bin/python3
import cgi
import os
import requests
import cgitb
import re
import sys
from os import environ
cgitb.enable()

print ('Content-Type: text/html; charset=utf-8\n')
print ()
print ('<HTML>')
print ('<HEAD><TITLE>Heng Me</TITLE></HEAD>')
print ('<BODY>')
print('asifbawp', file=sys.stderr)

session_id=False
if ('HTTP_COOKIE' in environ):
   for cookie in environ['HTTP_COOKIE'].split(';'):
      (key, value ) = cookie.strip().split('=')
      print(key,value)
      if key == "sessionID":
         session_id = value
        

print ('<H1> Hater livet </H1>')
print ('</br>') 
print ('<h2> Legg til en bok </h2>')
print ('<form method="POST"> Bok Navn: <input type = "text" name = "BokNavn" id = "BokNavn"> <br> Forfatter Navn:<input type = "text" name = "ForfatterNavn" id = "ForfatterNavn"> <input type="submit" value="Legg til" id = "submit" > </form>')
#print ('<script> submitForms(){ document.getElementById("BokNavn").value; document.getElementById("ForfatterNavn").value; } ')

form = cgi.FieldStorage()

BokNavn = form.getvalue('BokNavn')
ForfatterNavn = form.getvalue('ForfatterNavn')

if session_id and environ['REQUEST_METHOD']=='POST':
    xml=f'<bok><tittel>{BokNavn}</tittel><forfatterid>{ForfatterNavn}</forfatterid></bok>'
    r = requests.post('http://testmaskin:1337/bok', data=xml, headers= {'content-type':'text/xml; charset=utf8', 'cookies': session_id})

 

print ('</body>')
print ('</HTML>')
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

print( '<br>'.join([f'<a href="{f}">{f}</a>' for f in os.listdir() if f.endswith('.py')]) + '<BR>' )
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
print ('<form method="POST"> Fornavn: <input type = "text" name = "ForfatterFornavn" id = "ForfatterFornavn"> <br> Etternavn:<input type = "text" name = "ForfatterEtternavn" id = "ForfatterEtternavn"> Nasjonalitet: <input type = "text" name = "ForfatterNasjon" id = "ForfatterNasjon"> <input type="submit" value="Legg til" id = "submit" > </form>')

form = cgi.FieldStorage()
xml = False
url = False
print('OOOGABOOGA')
if 'BokNavn' in form: 
    BokNavn = form.getvalue('BokNavn')
    ForfatterNavn = form.getvalue('ForfatterNavn')
    xml = f'<bok><tittel>{BokNavn}</tittel><forfatterid>{ForfatterNavn}</forfatterid></bok>'
    url = 'http://rest:1337/bok'
    print('MEOWWWWW')
elif 'ForfatterFornavn' in form:
    ForfatterFornavn = form.getvalue('ForfatterFornavn')
    ForfatterEtternavn = form.getvalue('ForfatterEtternavn')
    ForfatterNasjon = form.getvalue('ForfatterNasjon')
    xml = f'<forfatter><fornavn>{ForfatterFornavn}</fornavn><etternavn>{ForfatterEtternavn}</etternavn><nasjonalitet>{ForfatterNasjon}</nasjonalitet></forfatter>'
    url = 'http://rest:1337/forfatter'
    print('HAHA I FOUND YER TREASURE')

print (xml)
print (url)
print (session_id)
print (environ['REQUEST_METHOD'])
#print (environ['HTTP_COOKIE'])



if session_id and environ['REQUEST_METHOD']=='POST' and url and xml:
    #xml=f'<bok><tittel>{BokNavn}</tittel><forfatterid>{ForfatterNavn}</forfatterid></bok>'
    cookies = {'sessionID': session_id}
    r = requests.post(url, data=xml, headers= {'content-type':'text/xml; charset=utf8'}, cookies= cookies)
    print (xml)

 

print ('</body>')
print ('</HTML>')

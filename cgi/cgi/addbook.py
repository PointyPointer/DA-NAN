#!/usr/bin/python3
import cgi
import os
import requests
import cgitb
import re
import sys
from os import environ
from xml.dom.minidom import parseString
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
def get_val_from_xml(element, tagname):
    return element.getElementsByTagName(tagname)[0].firstChild.nodeValue

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

forfattere = parseString(requests.get('http://rest:1337/forfatter').text).getElementsByTagName('query')
forfattere = {get_val_from_xml(f, 'forfatterID') :get_val_from_xml(f, 'fornavn') +' '+ get_val_from_xml(f, 'etternavn') for f in forfattere } 

print ('<H1> Hater livet </H1>')
print ('</br>') 
print ('<h2> Legg til en bok </h2>')
print ('<form method="POST"> Bok Navn: <input type = "text" name = "BokNavn" id = "BokNavn"> <br> Forfatter Navn:<select name="ForfatterNavn">')
for fID in forfattere:
    print(f'<option value="{fID}">{forfattere[fID]}</option>')
print('</select> <input type="submit" value="Legg til" id = "submit" > </form>')
print('<H2>Legg til forfatter</H2>')
print ('<form method="POST"> Fornavn: <input type = "text" name = "ForfatterFornavn" id = "ForfatterFornavn"> <br> Etternavn:<input type = "text" name = "ForfatterEtternavn" id = "ForfatterEtternavn"> Nasjonalitet: <input type = "text" name = "ForfatterNasjon" id = "ForfatterNasjon"> <input type="submit" value="Legg til" id = "submit" > </form>')



 

print ('</body>')
print ('</HTML>')

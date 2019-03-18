#!/usr/bin/python3
import cgi
import os
import requests
import cgitb
import re
from os import environ
from xml.dom.minidom import parseString
cgitb.enable()

print ('Content-Type: text/html; charset=utf-8\n')
print ()
print ('<HTML>')
print ('<HEAD><TITLE>Slette Bok</TITLE></HEAD>')
print ('<BODY>')

print( '<br>'.join([f'<a href="{f}">{f}</a>' for f in os.listdir() if f.endswith('.py')]) + '<br>' )
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

print('<br>')
if "tittel" in form:
    bID = form.getvalue('tittel')
    ForfatterNavn = form.getvalue('ForfatterNavn')
    xml = f'<bok><tittel>{bID}</tittel><forfatterID>{ForfatterNavn}<forfatterID></bok>'
    url = 'http://rest:1337/bok/' + bID




if session_id and environ['REQUEST_METHOD']=='POST' and url and xml:
    cookies = {'sessionID': session_id}
    r = requests.delete(url, data=xml, headers= {'content-type':'text/xml; charset=utf8'}, cookies= cookies)
    print (xml)


forfattere = parseString(requests.get('http://rest:1337/forfatter').text).getElementsByTagName('query')
forfattere = {get_val_from_xml(f, 'forfatterID') :{"fornavn": get_val_from_xml(f, 'fornavn'), "etternavn": get_val_from_xml(f, 'etternavn'), "nasjonalitet": get_val_from_xml(f, 'nasjonalitet')} for f in forfattere } 
bok = parseString(requests.get('http://rest:1337/bok').text).getElementsByTagName('query')
bok = {get_val_from_xml(b, 'bokID') :{"tittel": get_val_from_xml(b, 'tittel'), "forfatterID": get_val_from_xml(b, 'forfatterID')} for b in bok } 

print ('<form method="POST" name="boktittel" id="boktittel">')
print ('<select name = "tittel">')
for bID in bok:
    b=bok[bID]
    print(f'<option value = "{bID}"> {b["tittel"]} </option>')
print ('</select>')
print ('<input type = "submit" value="submit">')
print ('</form>')

#legg til submit med post og slette funksjon
#spør om databasen er ryddet opp i

print ("</BODY></HTML>")
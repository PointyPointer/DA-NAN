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

def get_val_from_xml(element, tagname):
    return element.getElementsByTagName(tagname)[0].firstChild.nodeValue

forfattere = parseString(requests.get('http://rest:1337/forfatter').text).getElementsByTagName('query')
forfattere = {get_val_from_xml(f, 'forfatterID') :{"fornavn": get_val_from_xml(f, 'fornavn'), "etternavn": get_val_from_xml(f, 'etternavn'), "nasjonalitet": get_val_from_xml(f, 'nasjonalitet')} for f in forfattere } 
bok = parseString(requests.get('http://rest:1337/bok').text).getElementsByTagName('query')
bok = {get_val_from_xml(b, 'bokID') :{"tittel": get_val_from_xml(b, 'tittel'), "forfatterID": get_val_from_xml(b, 'forfatterID')} for b in bok } 

#potensiellt benytte forms legg til extra rad for submite knapp, maybe en decent workaround
#select box for slett husk husk

print ('<table style="width:100%">')
print ('<tr>')
print ('<th>Fornavn </th>')
print ('<th> Etternavn </th>')
print ('<th> Nasjonalitet </th>')
print ('</tr>')
for fID in forfattere:
    f = forfattere[fID]
    print ('<tr>')  
    print (f'<td style = "text-align: center"> {f["fornavn"]} </td>')
    print (f'<td style = "text-align: center"> {f["etternavn"]} </td>') 
    print (f'<td style = "text-align: center">{f["nasjonalitet"]} </td>') 
    print ('</tr>')
print ('</table>')

print ('<table style="width:100%">')
print ('<tr>')
print ('<th>Tittel </th>')
print ('<th> ForfatterID </th>')
print ('</tr>')
for bID in bok:
    b = bok[bID]
    print ('<tr>')  
    print (f'<td style = "text-align: center"> {b["tittel"]} </td>')
    print (f'<td style = "text-align: center"> {b["forfatterID"]} </td>') 
    print ('</tr>')
print('</table>')

#sokBok = requests.get("http://rest:1337/bok/")
#print (sokBok.text)



print ("</BODY></HTML>")

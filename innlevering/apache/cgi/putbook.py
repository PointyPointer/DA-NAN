#!/usr/bin/python3
import cgi
import os
import requests
import cgitb
import re
from os import environ
from xml.dom.minidom import parseString

print ('Content-Type: text/html; charset=utf-8\n')
print ()
print ('<HTML>')
print ('<HEAD><TITLE>Endre Bok</TITLE></HEAD>')
print ('<BODY>')



print ('<H1> Hovedmeny til DAN-Prosjekt sine cgi filer</H1>')
print( '<br>'.join([f'<a href="{f}">{f}</a>' for f in os.listdir() if f.endswith('.py')]) + '<br>' )
cookies = {}
if ('HTTP_COOKIE' in environ):
   for cookie in environ['HTTP_COOKIE'].split(';'):
      if '=' in cookie:
          (key, value ) = cookie.strip().split('=')
          cookies[key] = value

def get_val_from_xml(element, tagname):
    return element.getElementsByTagName(tagname)[0].firstChild.nodeValue


#potensiellt benytte forms legg til extra rad for submite knapp, maybe en decent workaround
#select box for slett husk husk
cgitb.enable()
form = cgi.FieldStorage()
if "fput" in form:
    ForfatterFornavn = form.getvalue('fornavn')
    ForfatterEtternavn = form.getvalue('etternavn')
    ForfatterNasjon = form.getvalue('nasjonalitet')
    xml = f'<forfatter><fornavn>{ForfatterFornavn}</fornavn><etternavn>{ForfatterEtternavn}</etternavn><nasjonalitet>{ForfatterNasjon}</nasjonalitet></forfatter>'
    url = 'http://rest:1337/forfatter/' + form.getvalue("id")
elif "bput" in form:
    BokNavn = form.getvalue('tittel')
    ForfatterNavn = form.getvalue('forfatterID')
    xml = f'<bok><tittel>{BokNavn}</tittel><forfatterid>{ForfatterNavn}</forfatterid></bok>'
    url = 'http://rest:1337/bok/' + form.getvalue("bokid")

if cookies and environ['REQUEST_METHOD']=='POST' and url and xml:
    r = requests.put(url, data=xml, headers= {'content-type':'text/xml; charset=utf8'}, cookies= cookies)
    print (xml)


forfattere = parseString(requests.get('http://rest:1337/forfatter').text).getElementsByTagName('query')
forfattere = {get_val_from_xml(f, 'forfatterID') :{"fornavn": get_val_from_xml(f, 'fornavn'), "etternavn": get_val_from_xml(f, 'etternavn'), "nasjonalitet": get_val_from_xml(f, 'nasjonalitet')} for f in forfattere } 
bok = parseString(requests.get('http://rest:1337/bok').text).getElementsByTagName('query')
bok = {get_val_from_xml(b, 'bokID') :{"tittel": get_val_from_xml(b, 'tittel'), "forfatterID": get_val_from_xml(b, 'forfatterID')} for b in bok } 

print ('<table style="width:10%">')
print ('<tr>')
print ('<th>Fornavn </th>')
print ('<th> Etternavn </th>')
print ('<th> Nasjonalitet </th>')
print ('</tr>')
for fID in forfattere:
    f = forfattere[fID]
    print ('<form method="POST" name="forfatterput" id = {"f"+fID}>')
    print ('<tr>')  
    print (f'<td style = "text-align: center"> <input = "text" name = "fornavn" value = "{f["fornavn"]}"</td>' )
    print (f'<td style = "text-align: center"> <input = "text" name = "etternavn" value = "{f["etternavn"]}"  </td>') 
    print (f'<td style = "text-align: center"> <input = "text" name = "nasjonalitet" value = "{f["nasjonalitet"]}"  </td>') 
    print (f'<td style = "text-align: left"> <input type = "submit" name="fput" value = "Submit"> </td>')
    print (f'<input type = "text" style = "display: none;" name = "id" value = "{fID}">') 
    print ('</tr>')
    print ('</form>')
print ('</table>')


print ('<table style="width:10%">')
print ('<tr>')
print ('<th>Tittel </th>')
print ('<th> ForfatterID </th>')
print ('</tr>')
for bID in bok:
    b = bok[bID]
    print ('<form method="POST" name="bokput" id = {"b"+bID}>')
    print ('<tr>')  
    print (f'<td style = "text-align: center"> <input = "text" name = "tittel" value = "{b["tittel"]}" </td>')
    print (f'<td style = "text-align: center"> <input = "text" name = "forfatterID" value = "{b["forfatterID"]}" </td>') 
    print (f'<td style = "text-align: left"> <input type = "submit" name="bput" value = "Submit"> </td>')
    print (f'<input type = "text" style = "display: none;" name = "bokid" value = "{bID}">') 
    print ('</tr>')
    print ('</form>')
print('</table>')


      



#sokBok = requests.get("http://rest:1337/bok/")
#print (sokBok.text)



print ("</BODY></HTML>")

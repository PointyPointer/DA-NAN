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

print ('<HTML>')
print ('<HEAD><TITLE>Slette Bok</TITLE></HEAD>')
print ('<BODY>')
print ('<H1> Hovedmeny til DAN-Prosjekt sine cgi filer</H1>')
print( '<br>'.join([f'<a href="{f}">{f}</a>' for f in os.listdir() if f.endswith('.py')]) + '<br>' )
cookies = {}
if ('HTTP_COOKIE' in environ):
   for cookie in environ['HTTP_COOKIE'].split(';'):
      if '=' in cookie:
        (key, value ) = cookie.strip().split('=')
        # print(key,value)
        cookies[key] = value

def get_val_from_xml(element, tagname):
    return element.getElementsByTagName(tagname)[0].firstChild.nodeValue

# Building xml and url based on html form comming from browser/user
form = cgi.FieldStorage()
xml = False
url = False

# print('<br>')
if "tittel" in form:
    bID = form.getvalue('tittel')
    xml = f'<bok><tittel>{bID}</tittel></bok>'
    url = 'http://rest:1337/bok/' + bID
elif "forfatter" in form:
    fID = form.getvalue('forfatter')
    xml = f'<bok><forfatterID>{fID}</forfatterID></bok>'
    url = 'http://rest:1337/forfatter/' + fID
elif "bokslett" in form:
    xml = f'<bok></bok>'
    url = 'http://rest:1337/bok'
elif "forfatterslett" in form:
    xml = f'<bok><forfatterID> </forfatterID></bok>'
    url = 'http://rest:1337/forfatter/'


# Send delete request to API
if cookies and environ['REQUEST_METHOD']=='POST' and url and xml:
    r = requests.delete(url, data=xml, headers= {'content-type':'text/xml; charset=utf8'}, cookies= cookies)

# Get authors and books to show aviable choices to user
forfattere = parseString(requests.get('http://rest:1337/forfatter').text).getElementsByTagName('query')
forfattere = {get_val_from_xml(f, 'forfatterID') :{"fornavn": get_val_from_xml(f, 'fornavn'), "etternavn": get_val_from_xml(f, 'etternavn'), "nasjonalitet": get_val_from_xml(f, 'nasjonalitet')} for f in forfattere } 
bok = parseString(requests.get('http://rest:1337/bok').text).getElementsByTagName('query')
bok = {get_val_from_xml(b, 'bokID') :{"tittel": get_val_from_xml(b, 'tittel'), "forfatterID": get_val_from_xml(b, 'forfatterID')} for b in bok } 

# Create HTML to user/browser
print ('<form method="POST" name="boktittel" id="boktittel">')
print ('<select name = "tittel">')
for bID in bok:
    b=bok[bID]
    print(f'<option value = "{bID}"> {b["tittel"]} </option>')
print ('</select>')
print ('<input type = "submit" value="submit">')
print ('</form>')

print('<br>')

print ('<form method="POST" name="boktittel" id="boktittel">')
print ('<select name = "forfatter">')
for fID in forfattere:
    f=forfattere[fID]
    print(f'<option value = "{fID}"> {f["fornavn"]} {f["etternavn"]} </option>')
print ('</select>')
print ('<input type = "submit" value="submit">')
print ('</form>')

print ('<br>')

print ('<form method="POST" name="bokslett" id="bokslett">')
print ('<input type = "submit" name ="bokslett" value="Slett Alle Bøker">')
print ('</form>')

print ('<form method="POST" name="forfatterslett" id="forfatterslett">')
print ('<input type = "submit" name="forfatterslett" value="Slett Alle Forfattere">')
print ('</form>')

print ("</BODY></HTML>")
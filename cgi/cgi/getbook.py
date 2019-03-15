#!/usr/bin/python3
import cgi
import os
import requests
import cgitb
import re
cgitb.enable()


print ('Content-Type: text/html; charset=utf-8\n')
print ()
print ('<HTML>')
print ('<HEAD><TITLE>Hovedmeny</TITLE></HEAD>')
print ('<BODY>')

print( '<br>'.join([f'<a href="{f}">{f}</a>' for f in os.listdir() if f.endswith('.py')]) + '<BR>' )
print ('<H1> Hovedmeny til potetgreia </H1>')
print ('</br>') 
print ('<h2> Hent en post </h2>')
print ('<form method= "GET"> BokID: <input type="text" name="BokID"> <input type="submit" value="Hent post">')
print ('<input type = "radio" name = "sokevalgA" value = "Bok" /> BokID')
print ('<input type = "radio" name = "sokevalgB" value = "Forfatter" /> Forfatter </form>')


form = cgi.FieldStorage()

if form.getvalue ('sokevalgA'):
    urlstring = (os.environ.get("QUERY_STRING", "No Query String in url"))
    start_index = 6
    idNR = urlstring[start_index: urlstring.find("&")] #Kutter "BokID=".
    sokBok = requests.get("http://rest:1337/bok/" + str(idNR))
    print (sokBok.text)
elif form.getvalue('sokevalgB'):
    urlstring = (os.environ.get("QUERY_STRING", "No Query String in url"))
    forfatter = urlstring[urlstring.find("=")+1: urlstring.find("&")]
    sokForfatter = requests.get("http://rest:1337/forfatter/" + str(forfatter))
    print(sokForfatter.text)
else : 
    print('velg pls')
 


print ("</BODY></HTML>")



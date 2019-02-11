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
print ('<H1> Hovedmeny til potetgreia </H1>')
print ('</br>') 
print ('<h2> Hent en post </h2>')
print ('<form method= "GET"> BokID: <input type="text" name="BokID"> <input type="submit" value="Hent post"> </form>') #legg til action elns
#print ('<form method="GET"> <input type="submit" value="Submit"> </form>')


#form = cgi.FieldStorage()
#id=form.getValue(BokID.text)


urlstring = (os.environ.get("QUERY_STRING", "No Query String in url"))
start_index = 6
out = urlstring[start_index:] #Kutter "BokID=" har alltid konstant lengde så lett å kutte ut.
#print (out) 
sokBok = requests.get("http://rest:1337/bok/" + str(out))
print (sokBok.text)
print ("</BODY></HTML>")
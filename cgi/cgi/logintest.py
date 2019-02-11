#!/usr/bin/python3
import cgi
import os
import cgitb
cgitb.enable()

print ('Content-Type: text/html; charset=utf-8\n')
print ()
print('<HTML>')
print('<HEAD><TITLE>Faen</TITLE></HEAD>')
print ('<H1>Test for faen.</H1>')
#print ('<CENTER>')
print ('<form method="POST"> Brukernavn: <input type="text" name="brukernavn")> </form>')
print ('<form method="POST"> Passord: <input type="password" name="Passord")> </form>')
print ('<form method="POST"> <input type="submit" value="Submit"> </form>')
#print('</CENTER>')
print ('</BODY></HTML>')

#form = cgi.FieldStorage()
#password = "Testus"

#bnavn = form.getfirst('brukernavn')
#pord = form.getfirst('passord')
# pwd = 










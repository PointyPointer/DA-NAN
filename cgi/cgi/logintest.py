#!/usr/bin/python3
import cgi
import os
import cgitb
cgitb.enable()

form = cgi.FieldStorage()

bnavn = form.getvalue('brukernavn')
pord = form.getvalue('passord')

print ('Content-Type: text/html; charset=utf-8\n')
print ()
print ('<H1>Test for faen.</H1>')
print ('Heng meg')


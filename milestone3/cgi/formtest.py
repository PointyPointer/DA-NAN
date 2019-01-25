#!/usr/bin/python3
import os

print('Content-Type: text/html; charset=utf-8\n')

try:
	#print(os.envi	on)
	if 'CONTENT_LENGTH' in os.environ:
		inp = input()
		post = inp.split('&')
		print('<div>','POST:', post,'</div>')

	else:
		get = os.environ['QUERY_STRING'].split('&')
		print('<div>','GET:', get,'</div>')
except KeyError as err:
	print("Key error", err)

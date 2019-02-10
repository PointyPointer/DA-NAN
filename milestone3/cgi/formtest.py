#!/usr/bin/python3
import os

print('Content-Type: text/html; charset=utf-8\n')

# Debug
for k in os.environ:
	print(k + ' : ' + os.environ[k] + '<br>')
print('<br>')

try:
	if 'CONTENT_LENGTH' in os.environ:
		inp = input()
		post = {}
		for pair in inp.split('&'):
			post[pair.split('=')[0]] = pair.split('=')[1]
		print('<div>','POST:', post,'</div>')

	else:
		get = {}
		for pair in os.environ['QUERY_STRING'].split('&'):
			get[pair.split('=')[0]] = pair.split('=')[1]
		print('<div>','GET:', get,'</div>')

except KeyError as err:
	print("Key error", err)

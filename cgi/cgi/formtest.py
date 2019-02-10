#!/usr/bin/python3
import os

print('Content-Type: text/html; charset=utf-8\n')

try:
	if 'CONTENT_LENGTH' in os.environ:
		inp = input()
		post = {}
		for pair in inp.split('&'):
			post[pair.split('=')[0]] = pair.split('=')[1]
		print('<div>','POST:', post,'</div>')

	else:
		get = {}
		if os.environ['QUERY_STRING']:
			for pair in os.environ['QUERY_STRING'].split('&'):
				print(os.environ['QUERY_STRING'].split('&'))
				try:
					get[pair.split('=')[0]] = pair.split('=')[1]
				except IndexError as err:
					print(err)
		else:
			get = "Empty response :("
		print('<div>','GET:', get,'</div>')

except KeyError as err:
	print("Key error", err)

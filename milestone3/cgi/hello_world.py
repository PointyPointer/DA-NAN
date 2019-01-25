#!/usr/bin/python3

import time
print('Content-Type: text/html; charset=utf-8')

print()

print(f'<html><body>Hallo cgi, {time.strftime("%H:%M:%S")}</body></html')
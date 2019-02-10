#!/bin/bash
echo "Testing script for Potato-API";
echo "Enter command";

cmd="help";

while [[ $cmd=="quit" ]]; do
	read cmd;
	clear;


	if [[ $cmd = "help" ]]; then
		echo "commands:";
		echo "get, post, put and delete";
	fi
	if [[ -z $cmd ]]; then
		echo "commands:";
		echo "get, post, put and delete";
	fi
	
	if [[ $cmd = "get" ]]; then 
		echo "Table? ( bok / forfatter )"
		read table;
		echo "ID? (empty for all)"
		read id;
		echo ""
		echo "----------------------------------"
		if [[ -z $id ]]; then
			curl -s 127.0.0.1:1337/$table | xmlstarlet sel -t -v "request/query/tittel" -v "request/query/etternavn"
		else
			curl -s 127.0.0.1:1337/$table/$id | xmlstarlet sel -t -v "request/query/tittel" -v "request/query/etternavn"
		fi

	fi
done

echo "Bye";
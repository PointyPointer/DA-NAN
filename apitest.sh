#!/bin/bash
echo "Testing script for Potato-API";
echo "Enter command";

cmd="help";

while [[ $cmd != "quit" ]]; do
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
			if [[ $table = "bok" ]]; then
				curl -s 127.0.0.1:1337/bok | /usr/bin/xmlstarlet sel -T -t -m "request/query" -s D:N:- "bokID" -v "concat(bokID,'|',tittel, '|', bokID)" -n 
			elif [[ $table = "forfatter" ]]; then
				curl -s 127.0.0.1:1337/forfatter | /usr/bin/xmlstarlet sel -T -t -m "request/query" -s D:N:- "forfatterID" -v "concat(fornavn,'|',etternavn,'|',nasjonalitet, '|', forfatterID)" -n 
			fi
		else
			if [[ $table = "bok" ]]; then
				curl -s 127.0.0.1:1337/bok/$id | /usr/bin/xmlstarlet sel -T -t -m "request/query" -s D:N:- "bokID" -v "concat(bokID,'|',tittel)" -n 
			elif [[ $table = "forfatter" ]]; then
				curl -s 127.0.0.1:1337/forfatter/$id | /usr/bin/xmlstarlet sel -T -t -m "request/query" -s D:N:- "forfatterID" -v "concat(fornavn,' ',etternavn,'|',nasjonalitet)" -n 
			fi
		fi
	fi

	if [[ $cmd = "post" ]]; then
		echo "Table? ( bok / forfatter )"
		read table

		if [[ $table = "bok" ]]; then
			echo "Tittel:"
			read tittel
			echo "Forfatterid:"
			read forfatterID

			curl -X POST -d "<bok><tittel>$tittel</tittel><forfatterID>$forfatterID</forfatterID></bok>" 127.0.0.1:1337/bok --header "Content-Type:text/xml"				
		fi
		if [[ $table = "forfatter" ]]; then
			echo "Fornavn:"
			read fornavn
			echo "Etternavn"
			read etternavn
			echo "Nasjonalitet"
			read nasjonalitet

			curl -X POST -d "<forfatter><fornavn>$fornavn</fornavn><etternavn>$etternavn</etternavn><nasjonalitet>$nasjonalitet</nasjonalitet></forfatter>" 127.0.0.1:1337/forfatter --header "Content-Type:text/xml"				
		fi	
	fi

	if [[ $cmd = "put" ]]; then
		echo "Table? ( bok / forfatter )"
		read table
		
		if [[ $table = "bok" ]]; then
			echo "BokID?"
			read bokid
			echo "Felt? (tittel, forfatterID)"
			read felt
			echo "Ny verdi:"
			read value

			curl -X PUT -d "<bok><bokID>$bokid</bokID><$felt>$value</$felt></bok>" 127.0.0.1:1337/bok --header "Content-Type:text/xml"				
		fi
		
		if [[ $table = "forfatter" ]]; then
			echo "ForfatterID?"
			read forfatterid
			echo "Felt? (fornavn, etternavn, nasjonalitet)"
			read felt
			echo "Ny verdi:"
			read value

			curl -X PUT -d "<forfatter><forfatterID>$forfatterid</forfatterID><$felt>$value</$felt></forfatter>" 127.0.0.1:1337/forfatter --header "Content-Type:text/xml"				
		fi	
	fi

	if [[ $cmd = "delete" ]]; then
		echo "Table? ( bok / forfatter )"
		read table
		
		if [[ $table = "bok" ]]; then
			echo "BokID? (empty deletes all books)"
			read bokid
			echo "Confirm? (y/[n])"
			read confirm
			if [[ $confirm = "y" ]]; then
				if [[ -z $bokid ]]; then
					curl -X DELETE -d "<bok></bok>" 127.0.0.1:1337/bok --header "Content-Type:text/xml"				
				else
					curl -X DELETE -d "<bok><bokID>$bokid</bokID></bok>" 127.0.0.1:1337/bok/$bokid --header "Content-Type:text/xml"				
				fi
			fi


		fi
		
		if [[ $table = "forfatter" ]]; then
			echo "ForfatterID? (empty deletes all authors)"
			read forfatterid
			echo "Confirm? (y/[n])"
			read confirm
			if [[ $confirm = "y" ]]; then
				if [[ -z $forfatterid ]]; then
					curl -X DELETE -d "<forfatter></forfatter>" 127.0.0.1:1337/forfatter --header "Content-Type:text/xml"				
				else
					curl -X DELETE -d "<forfatter><forfatterID>$forfatterid</forfatterID></forfatter>" 127.0.0.1:1337/forfatter/$forfatterid --header "Content-Type:text/xml"				
				fi
			fi

		fi

	fi
done

echo "Bye";
#include <stdio.h>
#include <arpa/inet.h>
#include <unistd.h>
#include <stdlib.h>
#include <string.h>
#include <signal.h>

#define QUEUE_SIZE 20
#define PORT 80
#define GET_HEAD_SIZE 2048

int socketSetup();

int daemonize();

int writeHeader(int, int);


int main(){
	// Declarations
	int sd, client_sd;
	char buf[GET_HEAD_SIZE];

	// initialation of socket and binding
	sd = socketSetup();

	// Turn the process to a daemon
	daemonize();

	listen(sd, QUEUE_SIZE);
	// Main loop
	while(1){
		client_sd = accept(sd, NULL, NULL);		

		// Child
		if(fork()==0){
			// Read request
			read(client_sd, buf, GET_HEAD_SIZE);

			
			// Respond
			writeHeader(client_sd, 200)


			// terminate child
			shutdown(client_sd, SHUT_RDWR);
			exit(0);
		}
		// Parent
		else{
			close(client_sd);
		}
	}
	return 0;
}

int socketSetup(){
	int sd;
	struct sockaddr_in lok_adr;

	socket(AF_INET, SOCK_STREAM, IPPROTO_TCP);	
	// Free port after termination for faster debuging
	setsockopt(sd, SOL_SOCKET, SO_REUSEADDR, &(int){1}, sizeof(int));
	lok_adr.sin_family = AF_INET;
	lok_adr.sin_port = htons((u_short)PORT);
	lok_adr.sin_addr.s_addr = htonl(INADDR_ANY);

	if ( 0!=bind(sd, (struct sockaddr *)&lok_adr, sizeof(lok_adr)) ){
		// Log error
		exit(1);		
	}


	return sd;
}

int deamonize(){


	return 0;
}

int write_header(int sd, int status){
	dprintf(sd, "HTTP/1.1 200 OK\nContent-Type: text/plain\n\n");

	return 0;
}


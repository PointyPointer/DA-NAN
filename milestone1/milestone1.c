#include <stdio.h>
#include <arpa/inet.h>
#include <unistd.h>
#include <stdlib.h>
#include <string.h>
#include <signal.h>

#define QUEUE_SIZE 20
#define PORT 80
#define GET_HEAD_SIZE 2048
#define UID 1000
#define GID 1000

int socketSetup();

int daemonize();

// int writeHeader(int, int);

int writeBody(int, char*);

// char* getContentType();


int main(){
	// Declarations
	int sd, client_sd;
	char buf[GET_HEAD_SIZE];
	FILE *err;

	char *httpMethod;
	char *filePath;

	err = fopen("error.log", "a");

	// initialation of socket and binding
	sd = socketSetup();

	// Turn the process to a daemon
	//daemonize();

	listen(sd, QUEUE_SIZE);
	// Main loop
	while(1){
		client_sd = accept(sd, NULL, NULL);		

		// Child
		if(fork()==0){
			httpMethod = malloc(7);
			// Read request
			//parseRequest(client_sd, )
			// read(, buf, GET_HEAD_SIZE);

			
			// Respond
			//writeHeader(client_sd, 200)
			writeBody(client_sd, "test.asis");

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

	setuid( (uid_t) UID );
	setgid( (gid_t) GID );

	return sd;
}

int deamonize(){

	if(fork()){
		exit(0); //parent dies
	}
	setsid(); // Create session, free from tty
	signal(SIGTTOU, SIG_IGN); // 
	signal(SIGTTIN, SIG_IGN);
	signal(SIGTSTP, SIG_IGN); 

	if(fork()){
		exit(0); //sessionleader dies, cannot obtain tty
	}

	close(0);
	close(1);

	return 0;
}

// int write_header(int sd, int status){
// 	write(sd, "HTTP/1.1 200 OK\nContent-Type: text/plain\n\n", 42);

// 	return 0;
// }

int write_body(int sd, char* filePath){
	FILE *fp;
	int buffSize = 1024;
	char* buff[buffSize];
	int l;

	fp = fopen(filePath, "r");

	if(fp==0){
		dprintf(sd, "HTTP/1.1 404 Not Found\nContent-Type: text/plain\n\nFile not found");
	}
	else{
		l = 1;
		while(l){
			l = fread(buff, 1, buffSize, sd);
			fwrite(buff, 1, l, sd);			
		}

	}

}

// char* getContentType(){

// 	return 
// }

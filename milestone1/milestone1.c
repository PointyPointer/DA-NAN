#include <stdio.h>
#include <arpa/inet.h>
#include <unistd.h>
#include <stdlib.h>
#include <string.h>
#include <signal.h>
#include <sys/types.h>
#include <sys/stat.h>
#include <fcntl.h>
#include <time.h>

#include "katalog.h"

#define QUEUE_SIZE 20
#define PORT 80
#define GET_HEAD_SIZE 2048
#define UID 1000
#define GID 1000

int socketSetup();

int deamonize();

int writeBody(int, char*);

char* getTime();

int parseRequest(int, char*, char*);



int main(){
	// Declarations
	int sd, client_sd;
	char buf[GET_HEAD_SIZE];
	FILE* err;

	char *httpMethod;
	char *filePath;

	err = fopen("/var/log/web_error.log", "a");
	dup2(fileno(err), 2);
	fclose(err);

<<<<<<< HEAD
	if(chroot("/var/www")){
		perror(getTime());
		exit(1);
	}
=======
	chroot("/var/www");
>>>>>>> 878f9e0b7afcad2a510cbbe1cdf6e9628a01518d

	// initialation of socket and binding
	sd = socketSetup();

	// Turn the process to a daemon
	deamonize();

	listen(sd, QUEUE_SIZE);
	// Main loop
	while(1){
		client_sd = accept(sd, NULL, NULL);		
		// Child
		if(fork()==0){
			httpMethod = malloc(7);
			filePath = malloc(1000);
			// Read request
			
			parseRequest(client_sd, httpMethod, filePath);
			// read(, buf, GET_HEAD_SIZE);

			
			// Respond
			//writeHeader(client_sd, 200)
			writeBody(client_sd, filePath);


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

	sd = socket(AF_INET, SOCK_STREAM, IPPROTO_TCP);	
	// Free port after termination for faster debuging
	setsockopt(sd, SOL_SOCKET, SO_REUSEADDR, &(int){1}, sizeof(int));
	lok_adr.sin_family = AF_INET;
	lok_adr.sin_port = htons((u_short)PORT);
	lok_adr.sin_addr.s_addr = htonl(INADDR_ANY);

	if ( 0!=bind(sd, (struct sockaddr *)&lok_adr, sizeof(lok_adr)) ){
		perror(getTime());
		exit(1);		
	}

	setuid( (uid_t) UID );
	setgid( (gid_t) GID );

	return sd;
}

int deamonize(){

	if(fork()){
		raise(SIGSTOP);
		exit(0); //parent dies
	}
	setsid(); // Create session, free from tty
	signal(SIGTTOU, SIG_IGN); // 
	signal(SIGTTIN, SIG_IGN);
	signal(SIGTSTP, SIG_IGN);
	signal(SIGCHLD, SIG_IGN);

	if(fork()){
		exit(0); //sessionleader dies, cannot obtain tty
	}

	close(0);
	close(1);

	return 0;
}

int writeBody(int sd, char* filePath){
	FILE *fp;
	int buffSize = 1024;
	char* buff[buffSize];
	int l;

	fp = fopen(filePath, "r");

	if(fp==0){
		perror(getTime());
		dprintf(sd, "HTTP/1.1 404 Not Found\nContent-Type: text/plain\n\nFile not found");
	}
	else{
		l = 1;
		while (l = fread(buff, 1, 1024, fp)) {
	 		write(sd, buff, l);	
		}

	}

}

char* getTime(){
	time_t rawtime;
	struct tm * timeinfo;

	time ( &rawtime );
	timeinfo = localtime ( &rawtime );
	return strtok(asctime(timeinfo), "\n");
}

int parseRequest(int sd, char* httpMethod, char* filePath){
	char* buff;
	char* token;

	buff = malloc(5000);

	read(sd, buff, 5000);
	token = strtok(buff, " ");	

	strcpy(filePath, "/");

	// method of splitting string
	strcpy(httpMethod, token);
	strcat(filePath, strtok(NULL, " "));

	free(buff);

	return 0;
}

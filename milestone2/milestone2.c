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
#define ROOTDIR "/"

int socketSetup();

int deamonize();

int respond(int, char*);

char* getTime();

int parseRequest(int, char*, char*);

int isDir(char*);

int getMime(char*, char*);



int main(){
	// Declarations
	int sd, client_sd;
	char buf[GET_HEAD_SIZE];
	FILE* err;
	FILE *fp;

	char *httpMethod;
	char *filePath;

	err = fopen("/var/log/web_error.log", "a");
	dup2(fileno(err), 2);
	fclose(err);
	
	chroot("/var/www");
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
			
			parseRequest(client_sd, httpMethod, filePath);

			respond(client_sd, filePath);

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

int respond(int sd, char* filePath){
	int buffSize = 1024;
	char buff[buffSize];
	int l;

	if(isDir(filePath)){
		kataloglisting(filePath);
	}

	FILE* fp = fopen(filePath, "r");

	if(fp==0){
		perror(getTime());
		write(sd, "HTTP/1.1 404 Not Found\nContent-Type: text/plain\n\nFile not found", 63);
	}
	else{
		// Header
		write(sd, "HTTP/1.1 200 OK\nContent-Type: ", 30);
		l = getMime(filePath, buff);
		write(sd, buff, l);
		write(sd, "\n\n", 3);

		// Body
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

	strcpy(filePath, ROOTDIR);

	// method of splitting string
	strcpy(httpMethod, token);
	strcat(filePath, strtok(NULL, " "));


	return 0;
}

int isDir(char* path){
	int i;
	int ret;
	char lastChar;

	i = 0;
	lastChar = '/';
	while(path[i] != '\0'){
		lastChar = path[i];}

	if(lastChar == '/')
		return 0;
	else
		return 1;

}
int getMime(char* filePath, char* buff){

	size_t len = 1024;
	ssize_t read;
	
	// Find file extension
	char *ext = strrchr(filePath, (int)'.');
	if (ext == NULL) {
		return -1;
	}
	*ext ++;
	
	// Search after ext in mime file
	FILE* mime = fopen("mime.type", "r");
	if (mime == NULL) {
		return -2;
	}

	while ((read = getline(&buff,&len, mime)) != -1) {
		if (strstr(buff, ext)) {
			int sub = strlen(strchr(buff, (int)'\t'));
			return read - sub;			
		}
	}
	return -3;
}

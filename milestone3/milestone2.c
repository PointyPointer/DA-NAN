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

#include "dir.h" // void writeDirList(int sd, char *filsti)

#define QUEUE_SIZE 20
#define PORT 80
#define GET_HEAD_SIZE 2048
#define UID 1000
#define GID 1000

int socketSetup();

int deamonize();

int respond(int, char*, FILE*);

char* getTime();

int parseRequest(int, char*, char*);

int isDir(char*);

int getMime(char*, char*, FILE*);

int logAccess(int, char*, FILE*);


int main(int argc, char* argv[]){

	// Declarations
	int sd, client_sd;
	char buf[GET_HEAD_SIZE];
	FILE* err;
	FILE* mime;
	FILE* access;
	
	struct sockaddr_in addr;
	socklen_t addr_len = sizeof(addr);

	char *httpMethod;
	char *filePath;
	char *logPath = "/var/log/web_error.log";
	char *accessPath = "/var/log/web_access.log";
	char *newRootDir = "/var/www";
	char *mimePath = "/etc/mime.types";

	// argument handling
	for (int i = 0; i<argc; i++){
		if (strcmp(argv[i], "--log-file") == 0 && strcmp(argv[i+1], "--chroot-dir") != 0) {
			logPath = argv[i+1];
		} else if(strcmp(argv[i], "--chroot-dir") == 0 && strcmp(argv[i], "--log-file") != 0) {
			newRootDir = argv[i+1];
		}
	}

	// error stream to log
	err = fopen(logPath, "a");
	if(err == 0){
		perror(logPath);
		exit(1);
	}
	dup2(fileno(err), 2);
	fclose(err);

	mime = fopen(mimePath, "r");
	if(mime == 0){
		perror(mimePath);
		exit(1);
	}

	access = fopen(accessPath, "a");
	if(access == 0){
		perror(accessPath);
		exit(1);
	}
	
	if(chroot(newRootDir)){
		perror(newRootDir);
		exit(1);
	}
	
	// initialation of socket and binding
	sd = socketSetup();

	// Turn the process into a daemon
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

			respond(client_sd, filePath, mime);

			logAccess(client_sd, filePath, access);

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
	//close(1);

	return 0;
}

int respond(int sd, char* filePath, FILE* mime){
	int buffSize = 1024;
	char buff[buffSize];
	int l;
	FILE *fp;

	fp = fopen(filePath, "r");

	if(fp==0){
		perror(getTime());
		write(sd, "HTTP/1.1 404 Not Found\nContent-Type: text/plain\n\nFile not found", 63);
	}
	else{

		l = getMime(filePath, buff, mime);
		// error handling
		if(l == -1) { //. not in string, guess it is a folder
			write(sd, "HTTP/1.1 200 OK\nContent-Type: text/html\n\n", 41);
			write(sd, "<link rel=\"stylesheet\" type=\"text/css\" href=\"/style.css\" /> ", 60);
			write(sd, "<body>", 6);
			write(sd, "<img src=\"potet_logo.png\" height=\"100\" width=\"100\"/>", 52);
			writeDirList(sd, filePath);
			write(sd, "</body>", 7);
		} else if (l == -2) {
			perror(getTime());
			write(sd, "HTTP/1.1 510 Not Extended\nContent-Type: text/plain\n\nFurther extentions required", 79);
		} else if (l == -3) {
			perror(getTime());
			write(sd, "HTTP/1.1 415 Unsupported Media Type\nContent-Type: text/plain\n\nMedia type not supported", 86);
		} else {
			write(sd, "HTTP/1.1 200 OK\nContent-Type: ", 30);
			write(sd, buff, l);
			write(sd, "\n\n", 2);
			// Body
			while (l = fread(buff, 1, 1024, fp)) {
	 			write(sd, buff, l);	
			}
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

	// method of splitting string
	strcpy(httpMethod, token);
	strcpy(filePath, strtok(NULL, " "));

	free(buff);

	return 0;
}

int isDir(char* path){
	int i;
	int ret;
	char lastChar;


	i = 0;
	lastChar = '/';

	while(path[i] != '\0'){
		lastChar = path[i];
		i++;
	}

	if(lastChar == '/')
		return 1;
	
	else
		return 0;

}

int lineSearchMime(char* str, char* target){
	int i, j;
	int lik;

	lik = 1;
	i = j = 0;

	while(str[i] != '\t')
		i++;

	while(str[i] == '\t')
		i++;

	while(str[i] != '\0' && str[i] != '\n' || lik) {
		if(target[j] == '\0')
			return 1; // true
		if(str[i] == target[j] && lik)
			j++;
		else if(str[i] == ' ')
			lik = 1;
		else{ // ulike bokstaver
			lik = 0;
			j = 0;
		}
		i++;
	}
	if(lik)
		return 1;
	else
		return 0; // not found

}

int getMime(char* filePath, char* buff, FILE* mime){

	size_t len = 1024;
	ssize_t read;
	char *ext;
	int sub;
	
	// Find file extension
	ext = strrchr(filePath, (int)'.');
	if (ext == NULL) {
		perror(getTime());
		return -1;
	}
	*ext++;
	// Search after ext in mime file
	if (mime == NULL) {
		perror(getTime());
		return -2;
	}

	while ((read = getline(&buff,&len, mime)) != -1) {
		if (lineSearchMime(buff, ext)){
			printf("%s:%s\n", buff, ext);
			sub = strlen(strchr(buff, (int)'\t'));
			rewind(mime);
			return read - sub;			
		}
	}
	rewind(mime);
	return -3;
}

int logAccess(int s, char* filePath, FILE* access){
	socklen_t len;
	struct sockaddr_storage addr;
	char ipstr[INET6_ADDRSTRLEN];
	int port;

	len = sizeof addr;
	getpeername(s, (struct sockaddr*)&addr, &len);

	// deal with both IPv4 and IPv6:
	if (addr.ss_family == AF_INET) {
		struct sockaddr_in *s = (struct sockaddr_in *)&addr;
		port = ntohs(s->sin_port);
		inet_ntop(AF_INET, &s->sin_addr, ipstr, sizeof ipstr);
	} else { // AF_INET6
		struct sockaddr_in6 *s = (struct sockaddr_in6 *)&addr;
		port = ntohs(s->sin6_port);
		inet_ntop(AF_INET6, &s->sin6_addr, ipstr, sizeof ipstr);
	}

	fprintf(access,"{ip: %s, file:%s, time: %s}\n", ipstr, filePath, getTime());
}
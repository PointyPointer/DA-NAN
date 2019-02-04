#include <sys/types.h>
#include <sys/stat.h>
#include <dirent.h>
#include <unistd.h> 
#include <stdlib.h>
#include <stdio.h>
#include <string.h>

int writeTag(int sd, char* tagName, char* content){
  char* buff;


  buff = malloc(5000);
  strcpy(buff, "<");
  strcat(buff, tagName);
  strcat(buff, ">");

  strcat(buff, content);
  strcat(buff, "</");
  strcat(buff, tagName);
  strcat(buff, ">");

  write(sd, buff, strlen(buff));

  free(buff);
  return 0;
}

int writeA(int sd, char* temp, char* filePath){
  char* buff;


  buff = malloc(5000);


  strcpy(buff, "<td>");
  strcat(buff, "<a href='");
  strcat(buff, filePath);

  if (filePath[strlen(filePath) - 1] != '/'){
    strcat(buff, "/");
  }
  
  strcat(buff, temp);
  strcat(buff, "'>");

  strcat(buff, temp);
  strcat(buff, "</a></td>");

  //printf("%s\n", buff);

  write(sd, buff, strlen(buff));

  // strcpy(buff, "<");
  // strcat(buff, tagName);
  // strcat(buff, ">");

  // strcat(buff, content);
  // strcat(buff, "</");
  // strcat(buff, tagName);
  // strcat(buff, ">");

  // write(sd, buff, strlen(buff));

  free(buff);
  return 0;
}

void writeDirList(int sd, char *filsti){

  struct stat       stat_buffer;
  struct dirent    *ent;
  DIR              *dir;
  char             *buff;
  char             *temp;

  if ((dir = opendir (filsti)) == NULL) {
    perror (""); exit(1); }

  chroot("/var/www");

  chdir(filsti);

  buff = malloc(2000);
  temp = malloc(200);

  strcpy(buff, "Katalogen :");
  strcat(buff, filsti);
  writeTag(sd, "h1", buff);


  // write(sd, "------------------------------------\n");         
  // write(sd, "Rettigheter\tUID\tGID\tNavn\n");
  // write(sd, "------------------------------------\n");
  write(sd, "<table>", 7);
  
  write(sd, "<tr>", 4);
  writeTag(sd, "th", "Rettigheter");
  writeTag(sd, "th", "UID");
  writeTag(sd, "th", "GID");
  writeTag(sd, "th", "Navn");
  write(sd, "</tr>", 5);

  while ((ent = readdir (dir)) != NULL) {

    if (stat (ent->d_name, &stat_buffer) < 0) {
      perror(""); exit(2); }

    write(sd, "<tr>", 4);

    sprintf(temp, "%o", stat_buffer.st_mode & 0777);
    writeTag(sd, "td", temp);
    sprintf(temp, "%d",   stat_buffer.st_uid);
    writeTag(sd, "td", temp);
    sprintf(temp, "%d",   stat_buffer.st_gid);
    writeTag(sd, "td", temp);
    

    sprintf(temp, "%s",   ent->d_name);

    writeA(sd, temp, filsti);
    

    // writeTag(sd, "td", temp);
    // write(sd, "</a>", 4);

    // write(sd, "</tr>", 5);       

    // writeTag(sd, "%o\t\t", stat_buffer.st_mode & 0777 );      
    // write(sd, "%d\t",   stat_buffer.st_uid);
    // write(sd, "%d\t",   stat_buffer.st_gid);
    // write(sd, "%s\n",   ent->d_name);

  }
  write(sd, "</table>", 8);       

  free(buff);
  free(temp);
  closedir (dir);
}
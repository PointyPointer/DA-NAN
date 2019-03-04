CREATE TABLE Forfatter (

  forfatterID  INTEGER PRIMARY KEY AUTOINCREMENT,
  fornavn      VARCHAR(100),
  etternavn    VARCHAR(100),
  nasjonalitet VARCHAR(100)

);

CREATE TABLE Bok (

  bokID       INTEGER PRIMARY KEY AUTOINCREMENT,
  tittel      VARCHAR(250),
  forfatterID INTEGER,

  FOREIGN KEY (forfatterID) REFERENCES Forfatter (forfatterID)
);

CREATE TABLE Bruker ( 
  brukerID varchar(100) PRIMARY KEY, 
  passordhash TEXT(64), 
  fornavn VARCHAR(100), 
  etternavn VARCHAR(100)

);

CREATE TABLE Sesjon ( 
  sesjonsID TEXT(128), 
  brukerID INTEGER,

  PRIMARY KEY (sesjonsID),
  FOREIGN KEY (brukerID) REFERENCES Bruker (brukerID)
);

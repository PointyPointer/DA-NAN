CREATE TABLE Forfatter (

  forfatterID  SMALLINT(5),
  fornavn      VARCHAR(100),
  etternavn    VARCHAR(100),
  nasjonalitet VARCHAR(100),

  PRIMARY KEY (forfatterID)
);

CREATE TABLE Bok (

  bokID       SMALLINT(5),
  tittel      VARCHAR(250),
  forfatterID SMALLINT(5),

  PRIMARY KEY (bokID),
  FOREIGN KEY (forfatterID) REFERENCES Forfatter (forfatterID)
);

CREATE TABLE Bruker ( 
  brukerID SMALLINT(5), 
  passordhash TEXT(64), 
  fornavn VARCHAR(100), 
  etternavn VARCHAR(100),

  PRIMARY KEY (brukerID)
);

CREATE TABLE Sesjon ( 
  sesjonsID TEXT(128), 
  brukerID SMALLINT(5),

  PRIMARY KEY (sesjonsID),
  FOREIGN KEY (brukerID) REFERENCES Bruker (brukerID)
);
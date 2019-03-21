INSERT INTO Forfatter(forfatterID, fornavn, etternavn, nasjonalitet)
VALUES (1, 'Henrik', 'Ibsen', 'Norge');

INSERT INTO Forfatter(forfatterID, fornavn, etternavn, nasjonalitet)
VALUES (2, 'Bjørnstjere', 'Bjørnson', 'Norge');

INSERT INTO Forfatter(forfatterID, fornavn, etternavn, nasjonalitet)
VALUES (3, 'Alexander', 'Kielland', 'Norge');

INSERT INTO Bok(bokID, tittel, forfatterID)
VALUES (1, 'Peer Gynt', 1);
INSERT INTO Bok(bokID, tittel, forfatterID)
VALUES (2, 'Et dukkehjem', 1);
INSERT INTO Bok(bokID, tittel, forfatterID)
VALUES (3, 'En glad gut', 2);
INSERT INTO Bok(bokID, tittel, forfatterID)
VALUES (4, 'Lyset', 2);
INSERT INTO Bok(bokID, tittel, forfatterID)
VALUES (5, 'Sne', 3);
INSERT INTO Bok(bokID, tittel, forfatterID)
VALUES (6, 'Gift', 3);
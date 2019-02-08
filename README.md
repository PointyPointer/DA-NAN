# DA-NAN
Prosjektfiler for DA-NAN3000.

Prosjektet er delt inn i 6 milepeler.
## Milepæl 1
Enkel webserver skrevet i C. Leverer asis filer og kan kjøres fra Docker sitt scratch image. 


## Milepæl 2
Utvidelese av webserver. Kan levere flere filtyper, og har støtte for en katalogvisning av webserveren.

## Milepæl 3
Lagt til en ny Docker konteiner som bygger på httpd:alpine til å supportere CGI-skript.

## Milepæl 4
I denne milepælen er det lagt til et api som utveksler informasjon om bøker og forfattere i XML-format

XML-APIets endepunkter:

|Metode |End-point      |Beskrivelse                                               |
|-------|---------------|----------------------------------------------------------|
|GET    |/forfatter{/id}|Henter liste med forfattere, eventuelt en enkelt forfatter| 
|GET    |/bok{/id}      |Henter liste med bøker, eventuelt en enkelt bok           |
|POST   |/forfatter     |Legger til forfatter(krever innlogging)                   | 
|POST   |/bok           |Legger til bok(krever innlogging)                         |
|PUT    |/forfatter/id  |Endrer en forfatter(krever innlogging)                    |   
|PUT    |/bok/id        |Endrer en bok(krever innlogging)                          |
|DELETE |/forfatter{/id}|Sletter alle forfattere, eventuelt en enkelt forfatter(krever innlogging)|
|DELETE |/bok{/id}      |Sletter alle bøker, eventuelt en enkelt bok(krever innlogging)           |
|       |/signin        |                                                          |
|       |/signup        |                                                          |
|       |/logout        |                                                          |

|Tabell    |Elementer                                    |
|----------|---------------------------------------------|
|Bok       |Bokid, tittel, forfatterid                   |
|Forfratter|Forfatterid, fornavn, etternavn, nasjonalitet|
|Bruker    |Fornavn, Etternavn, passordhash              | 

## Milepæl 5
Under utvikling.

## Milepæl 6
Under utvikling.

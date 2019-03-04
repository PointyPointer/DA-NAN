const express = require('express')
const o2x = require('object-to-xml')
const parseString = require('xml2js').parseString
const bodyParser = require("body-parser")
const cookieParser = require('cookie-parser')
const xmlparser = require('express-xml-bodyparser')
const bcrypt = require('bcrypt')
const crypto = require('crypto') // Node in-built crypto libary

const port = 1337
const tables = ['forfatter', 'bok'] // used to verify valid table name from request

const app = express()

app.use(xmlparser())
app.use(cookieParser())


const sqlite3 = require('sqlite3').verbose()
// const h = new XMLHttpRequest()Responsen
app.use((req,res,next) => {
  res.header('accept', 'application/xml')
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE, OPTIONS')
  res.header('Access-Control-Allow-Headers', 'content-type')
  next()
})

//test if api is up and running correctly
app.get('/', (req, res) => res.send('Hello World!'))  

app.get('/:table', (req, res) => {
  let sql;
  if(req.params['table'] === 'forfatter')
    sql = 'SELECT * FROM forfatter'
  else
    sql = 'SELECT * FROM bok'
  
  if(tables.includes(req.params['table'].toLowerCase())){
    let db = new sqlite3.Database('/db/potatoDB.db')
    db.serialize(() => {
      db.all(sql, [],(err, rows) => {
        let obj = {'?xml version=\"1.0\" encoding=\"UTF-8\"?' : null, request: {'@':{schemaLocation:'http://127.0.0.1/api.xsd'},'#' : {query: rows} }}
        res.end(o2x(obj))
      })
    })
    db.close()
  }
  else{
    let obj = {'?xml version=\"1.0\" encoding=\"UTF-8\"?' : null, request: {query:null}}
    res.end(o2x(obj))
  }
})


app.get('/:table/:id', (req, res) => {
  let sql;
  if(req.params['table'] === 'forfatter')
    sql = 'SELECT * FROM forfatter WHERE forfatterID = ?'
  else
    sql = 'SELECT * FROM bok WHERE bokID = ?'
  
  if(tables.includes(req.params['table'].toLowerCase())){
    let db = new sqlite3.Database('/db/potatoDB.db')
    db.serialize(() => {
      db.all(sql, req.params['id'], (err, row) => {
        if(err){ console.error(err) }
        else{
          let obj = { '?xml version=\"1.0\" encoding=\"UTF-8\"?' : null, request: {'@':{schemaLocation:'http://127.0.0.1/api.xsd'},'#' : {query: row} }}
          res.end(o2x(obj))       
        }
      })
      db.close()    
    })
  }
  else{
    let obj = {'?xml version=\"1.0\" encoding=\"UTF-8\"?' : null, request: {query:null}}
    res.end(o2x(obj))
  }
  
})


app.post('/bok', (req, res) => {
  let db = new sqlite3.Database('/db/potatoDB.db')
  let count = 0;  
  console.log(req.body)

  
  // Check if all fields are present in request
  if(req.body.bok.forfatterid && req.body.bok.tittel){
    db.serialize(() => {

      let stmt = db.prepare('INSERT INTO Bok(tittel, forfatterID) VALUES (?,?)', err => {
        if(err) console.log('DB prepare', err)
      })
      stmt.run([req.body.bok.tittel[0], req.body.bok.forfatterid[0]], (err, row) => {
        if(err){
          console.log(err)
        }
        else{
          let obj = { 
            '?xml version=\"1.0\" encoding=\"UTF-8\"?' : null,
            oppdatert : 1
          }
          console.log(row)
          res.end(o2x(obj))       
        }
      })
      stmt.finalize()
    })
  }
  else{
    let obj = { 
      '?xml version=\"1.0\" encoding=\"UTF-8\"?' : null,
      oppdatert: count
    }
    res.send(o2x(obj))
  }
    
  db.close()
})


app.post('/forfatter', (req, res) => {
  let db = new sqlite3.Database('/db/potatoDB.db')
  console.log(req.body)

  
  // Check if all fields are present in request
  if(req.body.forfatter.fornavn && req.body.forfatter.etternavn && req.body.forfatter.nasjonalitet){
    db.serialize(() => {

      let stmt = db.prepare('INSERT INTO Forfatter(fornavn, etternavn, nasjonalitet) VALUES ((?),(?),(?))', err => {
        if(err) console.log('DB prepare', err)
      })
      stmt.run([req.body.forfatter.fornavn[0], req.body.forfatter.etternavn[0], req.body.forfatter.nasjonalitet[0]], (err, row) => {
        if(err){ console.log(err) }
        else{
          let obj = { '?xml version=\"1.0\" encoding=\"UTF-8\"?' : null, oppdatert : 1 }
          console.log(row)
          res.end(o2x(obj))       
        }
      })
      stmt.finalize()
    })
  }
  else{
    let obj = {'?xml version=\"1.0\" encoding=\"UTF-8\"?' : null, oppdatert: 0 }
    res.send(o2x(obj))
  }
    
  db.close()
})

app.put('/forfatter/:id', (req, res) => {
  let db = new sqlite3.Database('/db/potatoDB.db')
  console.log(req.body)
  let sql = 'UPDATE forfatter SET '
  let options = []

  if (req.body.forfatter.fornavn){
    sql += 'fornavn = ?,'
    options.push(req.body.forfatter.fornavn[0])
  }
  if(req.body.forfatter.etternavn){
    sql += 'etternavn = ?,'
    options.push(req.body.forfatter.etternavn[0])
  }
  if(req.body.forfatter.nasjonalitet){
    sql += 'nasjonalitet = ?,'
    options.push(req.body.forfatter.nasjonalitet[0])
  }
  sql = sql.slice(0, -1)
  sql += 'WHERE forfatterid = ?'
  options.push(req.params['id'])
  // Check if all fields are present in request
  if(req.body.forfatter.fornavn || req.body.forfatter.etternavn || req.body.forfatter.nasjonalitet && req.params['id']){
    db.serialize(() => {
      db.run(sql, options, (err, row) => {
        if(err){ console.log(err) }
        else{
          let obj = {'?xml version=\"1.0\" encoding=\"UTF-8\"?' : null, oppdatert : 1 }
          console.log(row)
          res.end(o2x(obj))       
        }
      })
    })
  }
  else{
    let obj = { '?xml version=\"1.0\" encoding=\"UTF-8\"?' : null, oppdatert: 0 }
    res.send(o2x(obj))
  } 
  db.close()
})


app.put('/bok/:id', (req, res) => {
  let db = new sqlite3.Database('/db/potatoDB.db')
  console.log(req.body)
  let sql
  let options
  if (req.body.bok.tittel && !req.body.bok.forfatterid){
    sql = 'UPDATE bok SET tittel = (?) WHERE bokID = (?)'
    options = [req.body.bok.tittel[0], req.params['id']]
  }
  else if(!req.body.bok.tittel && req.body.bok.forfatterid){
    sql = 'UPDATE bok SET forfatterID = (?) WHERE bokID = (?)'
    options = [req.body.bok.forfatterid[0], req.params['id']]
  }
  else if(req.body.bok.tittel && req.body.bok.forfatterid){
    sql = 'UPDATE bok SET tittel = (?), forfatterID = (?) WHERE bokID = (?)'
    options = [req.body.bok.tittel[0], req.body.bok.forfatterid[0], req.params['id']]
  }
  else{
    next()
  }
  // Check if all fields are present in request
  if(req.params['id'] && req.body.bok.tittel || req.body.bok.forfatterid){
    db.serialize(() => {
      db.run(sql, options, (err, row) => {
        if(err){ console.log(err) }
        else{
          let obj = {'?xml version=\"1.0\" encoding=\"UTF-8\"?' : null, oppdatert : 1 }
          console.log(row)
          res.end(o2x(obj))       
        }
      })
    })
  }
  else{
    let obj = { '?xml version=\"1.0\" encoding=\"UTF-8\"?' : null, oppdatert: 0 }
    res.send(o2x(obj))
  } 
  db.close()
})

app.delete('/:tablename', (req, res) => {
  let db = new sqlite3.Database('/db/potatoDB.db')
  
  let name = req.params['tablename'].toLowerCase()
  if(name === 'forfatter' || name === 'bok'){
    db.serialize(() => {
      name = name.charAt(0).toUpperCase() + name.slice(1) // Uppercase first letter
      db.all(`DELETE FROM ${name};`, [],(err, rows) => {
        let obj = {'?xml version=\"1.0\" encoding=\"UTF-8\"?' : null, 'status': 'ok'}
        res.end(o2x(obj))
      })      
    })
  }
  db.close()
})

app.delete('/:tablename/:id', (req, res) => {
  let db = new sqlite3.Database('/db/potatoDB.db')
  let sql  
  let name = req.params['tablename'].toLowerCase()
  let id = req.params['id']

  if(name === 'forfatter' || name === 'bok'){
    if(name === 'forfatter')
      sql = 'DELETE FROM forfatter WHERE forfatterID = ?'
    else if(name === "bok")
      sql = 'DELETE FROM bok WHERE bokID = ?'

    db.serialize(() => {
      db.run(sql, id, [],(err, rows) => {
        let obj = {'?xml version=\"1.0\" encoding=\"UTF-8\"?' : null, 'status': 'ok'}
        res.end(o2x(obj))
      })      
    })
  }
  db.close()
})

app.post('/signup', (req, res) => {
  let db = new sqlite3.Database('/db/potatoDB.db')
  let username = req.body.user.userid[0]
  let firstname = req.body.user.firstname[0]
  let lastname = req.body.user.lastname[0]
  let clearpwd = req.body.user.password[0]
  console.log(req)
  const saltRounds = 10

  bcrypt.hash(clearpwd, saltRounds, (err, hash) => {
    db.serialize(() => {
      let stmt = db.prepare('INSERT INTO Bruker(brukerID, passordhash, fornavn, etternavn) VALUES ((?),(?),(?),(?))', err => {
         if(err) console.log('DB prepare', err)
        })
      stmt.run([username, hash, firstname, lastname], (err, row) => {
         if(err){
            if(err.code = "SQLITE_CONSTRAINT"){
              let obj = { '?xml version=\"1.0\" encoding=\"UTF-8\"?' : null, oppdatert : 0 }
              res.end(o2x(obj))
            }
           console.log(err)
         }
         else{
           let obj = { '?xml version=\"1.0\" encoding=\"UTF-8\"?' : null, oppdatert : 1 }
           console.log(row)
           res.end(o2x(obj))
         }
       })
       stmt.finalize()

    })
    db.close()
  })
})

app.post('/signin', (req, res) => {
  let db = new sqlite3.Database('/db/potatoDB.db')
  let username = req.body.user.username[0]
  let clearpwd = req.body.user.password[0]
  let hashpwd
  let retobj = {'?xml version="1.0" encoding="UTF-8"?': null}

  console.log("Cookie: ", req.cookies)


  db.serialize(() => {
    let stmt = db.prepare('SELECT fornavn, passordhash FROM Bruker WHERE fornavn = ?', err => {
      if(err) console.log('DB prepare', err)
    })
    stmt.get(username, [], (err, row) => {
      if(err) console.log(err)
      hashpwd = row.passordhash

      bcrypt.compare(clearpwd, hashpwd, (err, success) => {
        if (err) throw err
        if(success === true) {
          crypto.randomBytes(256, (err, buf) => {
            if (err) throw err
            retobj.sessionID = buf.toString('base64')
            console.log("send response")
            res.cookie('sessionID', buf.toString('base64')).send(o2x(retobj))

          })

          // db.serialize(() => {
          // })  test
        } 
        else{ 
          console.log("No match")
          res.end(o2x(retobj)) 

        }
      })    
    }) 
 
    stmt.finalize()
  })

  db.close()
})

app.get('/logout', (req, res) => {

})

app.listen(port, () => console.log(`Rest API listening on port ${port}!`))

const express = require('express')
const app = express()
const o2x = require('object-to-xml')
const parseString = require('xml2js').parseString
const bodyParser = require("body-parser")
const xmlparser = require('express-xml-bodyparser')
const port = 1337   
const bcrypt = require('bcrypt')
const tables = ['forfatter', 'bok'] // used to verify valid table name from request

app.use(xmlparser())

const sqlite3 = require('sqlite3').verbose()
// const h = new XMLHttpRequest()Responsen
app.use((req,res,next) => {
  res.header('accept', 'application/xml')
  // res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE, OPTIONS')
  res.header('Access-Control-Allow-Headers', 'content-type')
  next()
})

//test if api is up and running correctly
app.get('/', (req, res) => res.send('Hello World!'))  

app.get('/:table', (req, res) => {
  
  if(tables.includes(req.params['table'].toLowerCase())){
    let db = new sqlite3.Database('/db/potatoDB.db')
    db.serialize(() => {
      db.all(`SELECT * FROM ${req.params['table']}`, [],(err, rows) => {
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
  let idName;
  if(req.params['table'] === 'forfatter')
    idName = 'forfatterID'
  else
    idName = 'bokID'
  
  if(tables.includes(req.params['table'].toLowerCase())){
    let db = new sqlite3.Database('/db/potatoDB.db')
    db.serialize(() => {
      db.all(`SELECT * FROM ${req.params['table']} WHERE ${idName} = ?`, req.params['id'], (err, row) => {
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


app.put('/forfatter', (req, res) => {
  let db = new sqlite3.Database('/db/potatoDB.db')
  console.log(req.body)

  
  // Check if all fields are present in request
  if(req.body.forfatter.fornavn && req.body.forfatter.etternavn && req.body.forfatter.nasjonalitet && req.body.forfatter.forfatterid){
    db.serialize(() => {

      let stmt = db.prepare('UPDATE Forfatter SET fornavn = (?), etternavn = (?), nasjonalitet = (?) WHERE forfatterID = (?)', err => {
        if(err) console.log('DB prepare', err)
      })
      stmt.run([req.body.forfatter.fornavn[0], req.body.forfatter.etternavn[0], req.body.forfatter.nasjonalitet[0], req.body.forfatter.forfatterid[0]], (err, row) => {
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
      oppdatert: 0
    }
    res.send(o2x(obj))
  }
    
  db.close()
})


app.put('/bok', (req, res) => {
  let db = new sqlite3.Database('/db/potatoDB.db')
  console.log(req.body)

  
  // Check if all fields are present in request
  if(req.body.bok.bokid && req.body.bok.tittel && req.body.bok.forfatterid){
    db.serialize(() => {

      let stmt = db.prepare('UPDATE Forfatter SET tittel = (?), forfatterID = (?) WHERE bokID = (?)', err => {
        if(err) console.log('DB prepare', err)
      })
      stmt.run([req.body.bok.tittel[0], req.body.bok.forfatterid[0], req.body.bok.bokid[0]], (err, row) => {
        if(err){ console.log(err) }
        else{
          let obj = {'?xml version=\"1.0\" encoding=\"UTF-8\"?' : null, oppdatert : 1 }
          console.log(row)
          res.end(o2x(obj))       
        }
      })
      stmt.finalize()
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
  let idname  
  let name = req.params['tablename'].toLowerCase()
  let id = req.params['id']
  if(name === 'forfatter' || name === 'bok'){
    if(name === 'forfatter')
      idName = 'forfatterID'
    else
      idName = 'bokID'


    db.serialize(() => {
      name = name.charAt(0).toUpperCase() + name.slice(1) // Uppercase first letter
      let stmt = db.prepare(`DELETE FROM ${name} WHERE ${idName} = (?);`, err => {
        if(err) console.log('DB prepare', err)
      })
      stmt.run(id, [],(err, rows) => {
        let obj = {'?xml version=\"1.0\" encoding=\"UTF-8\"?' : null, 'status': 'ok'}
        res.end(o2x(obj))
      })      
    })
  }
  db.close()
})

app.post('/signup', (req, res) => {
  let db = new sqlite3.Database('/db/potatoDB.db')
  let firstname = req.body.user.firstname[0]
  let lastname = req.body.user.lastname[0]
  let clearpwd = req.body.user.password[0]
  console.log(req)
  const saltRounds = 10

  bcrypt.hash(clearpwd, saltRounds, (err, hash) => {
    db.serialize(() => {
      let stmt = db.prepare('INSERT INTO Bruker(passordhash, fornavn, etternavn) VALUES ((?),(?),(?))', err => {
         if(err) console.log('DB prepare', err)
        })
      stmt.run([hash, firstname, req.body.lastname], (err, row) => {
         if(err){
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

app.post('/signin', (req, res, next) => {
  let db = new sqlite3.Database('/db/potatoDB.db')
  let username = req.body.user.username
  let clearpwd = req.body.user.password
  let hashpwd

  db.serialize(() => {
    let stmt = db.prepare('SELECT fornavn, passordhash FROM Bruker WHERE fornavn = ((?))', err => {
      if(err) console.log('DB prepare', err)
    })
    stmt.get(username, [], (err, row) => {
      if(err) console.log(err)
      hashpwd = row.passordhash     
    })  
  })
  bcrypt.compare(clearpwd, hashpwd, (err, res) => {
    if(res === true) {
      db.serialize(() => {
      })  
    } 
  })
  db.close()
})

app.get('/logout', (req, res) => {

})

app.listen(port, () => console.log(`Example app listening on port ${port}!`))

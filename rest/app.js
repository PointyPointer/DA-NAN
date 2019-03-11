const express = require('express')
const app = express()
const o2x = require('object-to-xml')
const parseString = require('xml2js').parseString
const bodyParser = require("body-parser")
const cookieParser = require('cookie-parser')
const xmlparser = require('express-xml-bodyparser')
const port = 1337   
const bcrypt = require('bcrypt')
const crypto = require('crypto') // Node in-built crypto libary
const tables = ['forfatter', 'bok'] // used to verify valid table name from request

app.use(cookieParser())

app.use(xmlparser())


const sqlite3 = require('sqlite3').verbose()
// const h = new XMLHttpRequest()Responsen
app.use((req,res,next) => {
  // console.log(req.cookies)

  res.header('accept', 'application/xml')
  res.header('Access-Control-Allow-Credentials', 'true')
  res.header('Access-Control-Allow-Origin', 'http://testmaskin')
  res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE, OPTIONS')
  res.header('Access-Control-Allow-Headers', 'content-type')
  if(req.method === 'OPTIONS')
    res.send(null)
  else
    next()
    
})


function logoutUser(res, status=401) {
  res.cookie('sessionID', '', {maxAge: -1})
  res.cookie('username', '', {maxAge: -1})
  res.status(status).end()
}

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
					let obj = { '?xml version=\"1.0\" encoding=\"UTF-8\"?' : null, oppdatert : 0 }
					console.log('oppdatert = 0')
					res.end(o2x(obj))
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

app.post('/login', (req, res, next) => {
  let db = new sqlite3.Database('/db/potatoDB.db')
  let username = req.body.user.username[0]
  let clearpwd = req.body.user.password[0]
  let hashpwd
  let retobj = {'?xml version="1.0" encoding="UTF-8"?': null}

  console.log("User: ", username, "; Password: ", clearpwd)
  console.log("Cookie: ", req.cookies)


  db.serialize(() => {
    let stmt = db.prepare('SELECT brukerID, passordhash FROM Bruker WHERE brukerID = (?)', err => {
      if(err) console.log('DB prepare', err)
    })
    stmt.get(username, [], (err, row) => {
      if(err) console.log('GET stmt', err)

      if (!row){
        console.log("No match")
				retobj.oppdatert = 0
				res.status(401).end(o2x(retobj)) 
      }
      else{
        console.log('Success!\n', row)
        hashpwd = row.passordhash

        let db2 = new sqlite3.Database('/db/potatoDB.db')
        bcrypt.compare(clearpwd, hashpwd, (err, success) => {
          if (err) throw err
          if(success) {
            crypto.randomBytes(256, (err, buf) => {
              if (err) throw err
              db2.serialize(() => {
                db2.run('INSERT INTO Sesjon(sesjonsID, brukerID) VALUES ((?),(?))', [retobj.sessionID, username], (err) => {
                  if (!err){
                    retobj.sessionID = buf.toString('base64')
                    res.cookie('sessionID', buf.toString('base64'), {maxAge: 360000})
                    res.cookie('username', username, {maxAge: 360000}).end(o2x(retobj))
                  }
                })
              })
						})
          }
					else { 
						console.log('No match')
						retobj.oppdatert = 0
						res.status(401).end(o2x(retobj)) 
					}
				})
			}
		})
    stmt.finalize()
  })

  db.close()
})

app.delete('/logout', (req, res) => {
	let db = new sqlite3.Database('/db/potatoDB.db')

	let username = req.cookies.username
	let sessionid = req.cookies.sessionID

	let retobj = {'?xml version\"1.0\" encoding\"UTF-8\"?' : null}

	db.serialize(() => {
		let stmt = db.prepare('DELETE FROM Sesjon WHERE sesjonsID=((?))', err => {
			if (err) console.log('stmt prepare', err)
		})

		stmt.run([sessionid], (err, row) => {
			if (err) console.log('Failed to remove session', err)
			if (!row) {
				console.log('Session does not exist', err)
				retobj.oppdatert = 0
        logoutUser(res, 200)
				// res.end(o2x(retobj))
			}
			else {
				console.log('Session removed')
				retobj.oppdatert = 1
        logoutUser(res, 200)

				// res.end(retobj)
			}
		})
		stmt.finalize()
	})
	db.close()
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
        let obj = {'?xml version=\"1.0\" encoding=\"UTF-8\"?' : null, request: {'@':{schemaLocation:'http://testmaskin/api.xsd'},'#' : {query: rows} }}
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
  if(req.params['table'] === 'forfatter'){
		if (isNaN(req.params['id'])){
			sql = 'SELECT * FROM forfatter WHERE etternavn = ?'
		}
		else{
    	sql = 'SELECT * FROM forfatter WHERE forfatterID = ?'
		}
	}
  else
    sql = 'SELECT * FROM bok WHERE bokID = ?'
  
  if(tables.includes(req.params['table'].toLowerCase())){
    let db = new sqlite3.Database('/db/potatoDB.db')
    db.serialize(() => {
      db.all(sql, req.params['id'], (err, row) => {
        if(err){ console.error(err) }
        else{
          let obj = { '?xml version=\"1.0\" encoding=\"UTF-8\"?' : null, request: {'@':{schemaLocation:'http://testmaskin/api.xsd'},'#' : {query: row} }}
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


// Check if user is logged in
app.use((req,res,next) => {
  //Temporary loggincheck;; TODO: Replace with DB Check
  console.log('In user check')
  console.log(req.cookies.sessionID)	 
	
  if(req.cookies.sessionID){
    let db = new sqlite3.Database('/db/potatoDB.db')
    db.serialize(() => {
      db.get('SELECT brukerID FROM Sesjon WHERE sesjonsID = ?', [req.cookies.sessionID], (err, row) => {
        console.log('ERROR HENG ME I HELVETE', err)
        console.log('Cookie:', req.cookies.sessionID)
        console.log('Row:', row)
        // res.cookie('')
        // res.end(o2x(obj))
        if(row){
          console.log('Innlogget')
          next()
        }
        else{
          console.log('Ikke innlogget')
          logoutUser(res)
        }

      })

    })
  }


  //res.status(401).send('Not logged in')
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
  if(tables.includes(name)){
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

  if(tables.includes(name)){
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

app.listen(port, () => console.log(`Example app listening on port ${port}!`))

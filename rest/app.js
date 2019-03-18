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

// Check if value is of type. If value is an array, it 
// check if all values in array is of the specified type
// Needed for type checking when inserting data in sqlite3 DB
// which have no strict typematching
function checkValue(val, type='string'){
	return true

 //  if(val && typeof val === 'object' && Array.isArray(val))
	// 	return val.every(entry => typeof entry === type || typeof entry === 'number' && Number(entry))
	
	// else if(val && typeof val === type)
	// 	return true

	// return false
}

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
							let sessionID = buf.toString('hex')
              db2.serialize(() => {
                db2.run('INSERT INTO Sesjon(sesjonsID, brukerID) VALUES (?, ?)', [sessionID, username], (err) => {
                  console.log('ERROR!!!!!', err)
                  if (!err){
                    retobj.sessionID = sessionID
                    res.cookie('sessionID', sessionID, {maxAge: 360000})
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
	let sql = "SELECT brukerID FROM Sesjon WHERE sesjonsID = ?"
  
	if(req.cookies.sessionID){
    let db = new sqlite3.Database('/db/potatoDB.db')
    db.serialize(() => {
      db.get(sql, [req.cookies.sessionID], (err, row) => {
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
	else{
		console.log('Need login')
		logoutUser(res)
	}
})

app.post('/bok', (req, res) => {
  let db = new sqlite3.Database('/db/potatoDB.db')
  let count = 0;
  console.log(req.body)

  
  // Check if all fields are present in request
  if(checkValue(req.body.bok.forfatterid, 'number') && checkValue(req.body.bok.tittel, 'string')){ 
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
      oppdatert: count,
			melding: "Error in input, may be missing values or not excpected types"
    }
    res.send(o2x(obj))
  }
    
  db.close()
})


app.post('/forfatter', (req, res) => {
  let db = new sqlite3.Database('/db/potatoDB.db')
  console.log(req.body)

  
  // Check if all fields are present in request
  if( checkValue( req.body.forfatter.fornavn, 'string') && 
		  checkValue( req.body.forfatter.etternavn, 'string') && 
			checkValue( req.body.forfatter.nasjonalitet, 'string')) {
    
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
  if(req.params['id'] && req.body.bok.tittel || checkValue(req.body.bok.forfatterid , 'number')){
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

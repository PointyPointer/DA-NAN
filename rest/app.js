const express = require('express')
const app = express()
const o2x = require('object-to-xml')
const parseString = require('xml2js').parseString;
const bodyParser = require("body-parser")
const xmlparser = require('express-xml-bodyparser')
const port = 1337 	

//app.use(bodyParser.urlencoded({ extended: false }));
// app.use(xmlparser());
// app.use(express.urlencoded());
app.use(xmlparser());

const sqlite3 = require('sqlite3').verbose()
// const h = new XMLHttpRequest()Responsen

app.get('/', (req, res) => res.send('Hello World!'))	

app.get('/forfatter', (req, res) => {
	var db = new sqlite3.Database('/db/potatoDB.db')
	db.serialize(() => {
		db.all('SELECT * FROM Forfatter;', [],(err, rows) => {
			var obj = {'?xml version=\"1.0\" encoding=\"iso-8859-1\"?' : null, forfatter : rows }
			res.end(o2x(obj))
		})			
	})
	db.close()
})


app.get('/forfatter/:forfatterID', (req, res) => {
	let db = new sqlite3.Database('/db/potatoDB.db')
	db.serialize(() => {

		let stmt = db.prepare('SELECT * FROM Forfatter WHERE forfatterID = (?)', err => {
			if(err) console.log('DB prepare', err)
		})
		console.log('forfatter id:', req.params['forfatterID'])
		stmt.get(req.params['forfatterID'], (err, row) => {
			if(err){ console.log(err) }
			else{
				var obj = { '?xml version=\"1.0\" encoding=\"iso-8859-1\"?' : null, forfatter : row }
				console.log(row)
				res.end(o2x(obj))				
			}
		})
		stmt.finalize()
		db.close()		
	})
})


app.get('/bok', (req, res) => {
	var db = new sqlite3.Database('/db/potatoDB.db')
	db.serialize(() => {
		db.all('SELECT * FROM Bok;', [],(err, rows) => {
			var obj = { '?xml version=\"1.0\" encoding=\"iso-8859-1\"?' : null, bok : rows }
			res.end(o2x(obj))
		})			
	})
	db.close()
})


app.get('/bok/:bokID', (req, res) => {
	let db = new sqlite3.Database('/db/potatoDB.db')
	db.serialize(() => {

		let stmt = db.prepare('SELECT * FROM Bok WHERE bokID = (?)', err => {
			if(err) console.log('DB prepare', err)
		})
		console.log('forfatter id:', req.params['forfatterID'])
		stmt.get(req.params['bokID'], (err, row) => {
			if(err){
				console.log(err)
			}
			else{
				var obj = { 
				  '?xml version=\"1.0\" encoding=\"iso-8859-1\"?' : null,
				  bok : row
				}
				console.log(row)
				res.end(o2x(obj))				
			}
		})
		stmt.finalize()
		db.close()		
	})
})


app.post('/bok', (req, res) => {
	let db = new sqlite3.Database('/db/potatoDB.db')
	let count = 0;	
	console.log(req.body)

	
	// Check if all fields are present in request
	if(req.body.bok.forfatterid && req.body.bok.tittel){
		db.serialize(() => {

			let stmt = db.prepare('INSERT INTO Bok(tittel, forfatterID) VALUES ((?),(?))', err => {
				if(err) console.log('DB prepare', err)
			})
			stmt.run([req.body.bok.tittel[0], req.body.bok.forfatterid[0]], (err, row) => {
				if(err){
					console.log(err)
				}
				else{
					var obj = { 
					  '?xml version=\"1.0\" encoding=\"iso-8859-1\"?' : null,
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
		var obj = { 
		  '?xml version=\"1.0\" encoding=\"iso-8859-1\"?' : null,
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
				if(err){
					console.log(err)
				}
				else{
					var obj = { '?xml version=\"1.0\" encoding=\"iso-8859-1\"?' : null, oppdatert : 1 }
					console.log(row)
					res.end(o2x(obj))				
				}
			})
			stmt.finalize()
		})
	}
	else{
		var obj = {'?xml version=\"1.0\" encoding=\"iso-8859-1\"?' : null, oppdatert: 0 }
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
					var obj = { 
					  '?xml version=\"1.0\" encoding=\"iso-8859-1\"?' : null,
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
		var obj = { 
		  '?xml version=\"1.0\" encoding=\"iso-8859-1\"?' : null,
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
					var obj = {'?xml version=\"1.0\" encoding=\"iso-8859-1\"?' : null, oppdatert : 1 }
					console.log(row)
					res.end(o2x(obj))				
				}
			})
			stmt.finalize()
		})
	}
	else{
		var obj = { '?xml version=\"1.0\" encoding=\"iso-8859-1\"?' : null, oppdatert: 0 }
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
				var obj = {'?xml version=\"1.0\" encoding=\"iso-8859-1\"?' : null, 'status': 'ok'}
				res.end(o2x(obj))
			})			
		})
	}
	db.close()
})

app.delete('/:tablename/:id', (req, res) => {
	let db = new sqlite3.Database('/db/potatoDB.db')
	
	let name = req.params['tablename'].toLowerCase()
	let id = req.params['id']
	if(name === 'forfatter' || name === 'bok'){
		if(name === 'forfatter')
			let idName = 'forfatterID'
		else
			let idName = 'bokID'


		db.serialize(() => {
			name = name.charAt(0).toUpperCase() + name.slice(1) // Uppercase first letter
			let stmt = db.prepare(`DELETE FROM ${name} WHERE ${idName} = (?);`, err => {
				if(err) console.log('DB prepare', err)
			})
			stmt.run(id, [],(err, rows) => {
				var obj = {'?xml version=\"1.0\" encoding=\"iso-8859-1\"?' : null, 'status': 'ok'}
				res.end(o2x(obj))
			})			
		})
	}
	db.close()
})

app.listen(port, () => console.log(`Example app listening on port ${port}!`))
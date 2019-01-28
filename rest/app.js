const express = require('express')
const app = express()
const o2x = require('object-to-xml')
const parseString = require('xml2js').parseString;
const bodyParser = require("body-parser")
const xmlparser = require('express-xml-bodyparser')
const port = 1337 	

// app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
// app.use(xmlparser());
// app.use(express.json());
// app.use(express.urlencoded());
app.use(xmlparser());

const sqlite3 = require('sqlite3').verbose()
// const h = new XMLHttpRequest()

app.get('/', (req, res) => res.send('Hello World!'))	

app.get('/forfatter', (req, res) => {
	var db = new sqlite3.Database('/db/potatoDB.db')
	db.serialize(() => {
		db.all('SELECT * FROM Forfatter;', [],(err, rows) => {
			var obj = { 
			  '?xml version=\"1.0\" encoding=\"iso-8859-1\"?' : null,
			  forfatter : rows
			}
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
			if(err){
				console.log(err)
			}
			else{
				var obj = { 
				  '?xml version=\"1.0\" encoding=\"iso-8859-1\"?' : null,
				  forfatter : row
				}
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
			var obj = { 
			  '?xml version=\"1.0\" encoding=\"iso-8859-1\"?' : null,
			  bok : rows
			}
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
				  forfatter : row
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
	//console.log(req)
	console.log(req.body)
	// db.serialize(() => {


	// 	let stmt = db.prepare('SELECT * FROM Bok WHERE bokID = (?)', err => {
	// 		if(err) console.log('DB prepare', err)
	// 	})
	// 	console.log('forfatter id:', req.params['forfatterID'])
	// 	stmt.get(req.params['bokID'], (err, row) => {
	// 		if(err){
	// 			console.log(err)
	// 		}
	// 		else{
	// 			var obj = { 
	// 			  '?xml version=\"1.0\" encoding=\"iso-8859-1\"?' : null,
	// 			  forfatter : row
	// 			}
	// 			console.log(row)
	// 			res.end(o2x(obj))				
	// 		}
	// 	})
	// 	stmt.finalize()
	// 	db.close()		
	// })
	res.send(":)")
})




app.listen(port, () => console.log(`Example app listening on port ${port}!`))
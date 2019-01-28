const express = require('express')
const app = express()
const port = 1337

var sqlite3 = require('sqlite3').verbose()
var db = new sqlite3.Database('/db/potato.db')

// db.serialize(function () {
//   db.run('CREATE TABLE lorem (info TEXT)')
//   var stmt = db.prepare('INSERT INTO lorem VALUES (?)')

//   for (var i = 0; i < 10; i++) {
//     stmt.run('Ipsum ' + i)
//   }

//   stmt.finalize()

//   db.each('SELECT rowid AS id, info FROM lorem', function (err, row) {
//     console.log(row.id + ': ' + row.info)
//   })
// })

// db.close()


app.get('/', (req, res) => res.send('Hello World!'))

app.get('/forfatter', (req, res) => {
	db.serialize(() => {
		db.each('SELECT * FROM Forfatter', (err, row) => {
			res.send(row.fornavn + " " +  row.etternavn)
		})
	})
	db.close()
})
app.get('/forfatter/:forfatterID', (req, res) => res.send('Hello World!'))

app.get('/bok', (req, res) => res.send('Hello World!'))


app.listen(port, () => console.log(`Example app listening on port ${port}!`))
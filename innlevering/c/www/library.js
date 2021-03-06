function createModal(){
	// Get the modal
	let modal = document.getElementById('myModal');
	let modalcontent = document.getElementById('modalbody');
	let span = document.getElementsByClassName("close")[0];


	// When the user clicks the button, open the modal 
	modal.style.display = "block";

	// When the user clicks on <span> (x), close the modal
	span.onclick = function() {
	  modal.style.display = "none";
	  while (modalcontent.hasChildNodes()) {
    	modalcontent.removeChild(modalcontent.lastChild);
	  }
	}

	// When the user clicks anywhere outside of the modal, close it
	window.onclick = function(event) {
	  if (event.target == modal) {
	    modal.style.display = "none";
	    while (modalcontent.hasChildNodes()) {
	    	modalcontent.removeChild(modalcontent.lastChild);
		}
	  }
	}

	return modalcontent

}


function createAuthorForm(){
	let content = createModal()

	document.getElementById('modalhead').innerHTML = "Ny forfatter"

	let lbfn = document.createElement("div");
	lbfn.innerHTML = "Fornavn" 
	let fn = document.createElement("input");
	
	let lben = document.createElement("div");
	lben.innerHTML = "Etternavn" 
	let en = document.createElement("input");
	
	let lbna = document.createElement("div");
	lbna.innerHTML = "Nasjon" 
	let na = document.createElement("input");
	
	let sub = document.createElement("button");
	sub.innerHTML = "Lagre"

	let test = [lbfn, fn, lben, en, lbna, na, sub]
	test.forEach(el => {
		content.appendChild(el)
	})

	sub.onclick = (event) => {
		document.getElementById('myModal').style.display = "none";
		
		xhttp.open("POST", "http://testmaskin:1337/forfatter")
		xhttp.setRequestHeader("Content-Type", "text/xml");
		xhttp.send(`<forfatter><fornavn>${fn.value}</fornavn><etternavn>${en.value}</etternavn><nasjonalitet>${na.value}</nasjonalitet></forfatter>`)
		xhttp.onreadystatechange = function() {
			if (this.readyState == 4 && this.status == 200) {
				window.location.reload(false);
			}
		}	

	}

	return test
}

function createBookForm(){

	let content = createModal()

	document.getElementById('modalhead').innerHTML = "Ny bok"

	let lbti = document.createElement("div");
	lbti.innerHTML = "Tittel" 
	let ti = document.createElement("input");
	
	let lbfr = document.createElement("div");
	lbfr.innerHTML = "Forfatter" 
	let se = document.createElement("select");

	for (var id in window.forfatter) {
		let op = document.createElement("option");
		op.value = id
		op.innerHTML = window.forfatter[id]['navn']
		se.appendChild(op)
	}
	
	let sub = document.createElement("button");
	sub.innerHTML = "Lagre"

	let test = [lbti, ti, lbfr, se, sub]
	test.forEach(el => {
		content.appendChild(el)
	})

	sub.onclick = (event) => {
		document.getElementById('myModal').style.display = "none";
		xhttp.open("POST", "http://testmaskin:1337/bok")
		xhttp.setRequestHeader("Content-Type", "text/xml");
		xhttp.send(`<bok><tittel>${ti.value}</tittel><forfatterID>${se.value}</forfatterID></bok>`)
		xhttp.onreadystatechange = function() {
			if (this.readyState == 4 && this.status == 200) {
				window.location.reload(false);
			}
		}
	}

	return test
}

function edit(table, c1, c2, elId){
	let test;
	if (table === 'bok'){
		let ti = c1
		let se = c2
		let ret = '<bok>'
		let url = "http://testmaskin:1337/bok/" + elId

		console.log("Editing book")

		test = createBookForm()
		document.getElementById('modalhead').innerHTML = "Rediger"

		test[1].value = ti
		test[3].value = se

		test[4].onclick = (event) => {
			console.log("Sending edit to api")
			document.getElementById('myModal').style.display = "none";
			if (test[1].value !== ti) ret += `<tittel>${test[1].value}</tittel>`
			if (test[3].value !== se) ret += `<forfatterID>${test[3].value}</forfatterID>`
			ret += '</bok>'

			
			console.log('ret')
			console.log(ret)

			xhttp.open("PUT", url)
			xhttp.setRequestHeader("Content-Type", "text/xml");
			xhttp.send(ret)

			xhttp.onreadystatechange = function() {
  				if (this.readyState == 4 && this.status == 200) {
					console.log('---------------refresh page--------------------')

					window.location.reload(false);

  				
  				}
  			}

		}
	}
	else if (table === 'forfatter'){
		let fn = c1.split(' ').slice(0, -1)
		let en = c1.split(' ').slice(-1)
		let na = c2
		let ret = '<forfatter>'


		
		test = createAuthorForm()
		document.getElementById('modalhead').innerHTML = "Rediger"

		test[1].value = fn
		test[3].value = en
		test[5].value = na

		test[6].onclick = (event) => {
			document.getElementById('myModal').style.display = "none";
			if (test[1].value !== fn) ret += `<fornavn>${test[1].value}</fornavn>`
			if (test[3].value !== en) ret += `<etternavn>${test[3].value}</etternavn>`
			if (test[5].value !== na) ret += `<nasjonalitet>${test[5].value}</nasjonalitet>`

			xhttp.open("PUT", "http://testmaskin:1337/forfatter/" + elId)
			xhttp.setRequestHeader("Content-Type", "text/xml");
			xhttp.send(ret + '</forfatter>')
			xhttp.onreadystatechange = function() {
  				if (this.readyState == 4 && this.status == 200) {
					window.location.reload(false);
  				}
  			}

		}
	}
}

function deleteEl(row, table, elId){
	row.parentElement.removeChild(row)

	xhttp.open("DELETE", `http://testmaskin:1337/${table}/${elId}`)
	xhttp.send()
}

function add(tableid, first, second, elId) {
  let table = document.getElementById(tableid);
  let row = table.insertRow(-1);
  let cell1 = row.insertCell(0);
  let cell2 = row.insertCell(1);
  let cell3 = row.insertCell(2);
  let editbn = document.createElement('span')
  let deletebn = document.createElement('span')

  cell1.innerHTML = first;
  cell2.innerHTML = (window.forfatter[second] && window.forfatter[second]['navn'] || second );

  // editbn.OnClick = edit
  editbn.className += 'fa fa-pencil'
  editbn.style = "font-size:16px; margin: 0px 5px;"
  
  editbn.onclick = () => {
  	edit(tableid, first, second, elId)
  }

  deletebn.className += 'fa fa-times'
  deletebn.style = "font-size:16px; margin-left: 5px;"
  
  deletebn.onclick = () => {
  	deleteEl(row, tableid, elId)
  }
  
  cell3.class = 'isauth'
  editbn.class = 'isauth'
  deletebn.class = 'isauth'
  cell3.appendChild(editbn) 
  cell3.appendChild(deletebn)

  if (tableid === 'bok'){
  	let forfatterNavn = window.forfatter[second] ? window.forfatter[second]['navn'] : second
  	window.bok[elId] = {'tittel': first, 'forfatter': forfatterNavn, 'forfatterID': second}
  	console.log(second)
  }
  else if(tableid === 'forfatter'){
  	window.forfatter[elId] = {'navn': first, 'nasjonalitet': second}
  }

}

function deleteBooks(){
	xhttp.open("DELETE", "http://testmaskin:1337/bok")
	xhttp.setRequestHeader("Content-Type", "text/xml");
	xhttp.send(null)
	window.bok = {}
	xhttp.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200) {
		window.location.reload(false);
		}
	}
}
function deleteAuthors(){
	xhttp.open("DELETE", "http://testmaskin:1337/forfatter")
	xhttp.setRequestHeader("Content-Type", "text/xml");
	xhttp.send(null)
	window.forfatter = {}
	xhttp.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200) {
		window.location.reload(false);
		}
	}
}





// Code running on loading
window.forfatter = {}
window.bok = {}

let parser = new DOMParser()

let xhttp = new XMLHttpRequest()
// Allows sending cookies to api
xhttp.withCredentials = true

xhttp.onreadystatechange = function() {
  if (this.readyState == 4 && this.status == 200) {
    let txt = this.responseText
    let list = parser.parseFromString(txt, "text/xml").getElementsByTagName('query')
    console.log(txt)
    if(this.responseURL === 'http://testmaskin:1337/forfatter'){
    	for (let i = list.length - 1; i >= 0; i--) {
	    	console.log(list[i].getElementsByTagName('fornavn'))
		add('forfatter', 
	    		list[i].getElementsByTagName('fornavn')[0].innerHTML + ' ' + list[i].getElementsByTagName('etternavn')[0].innerHTML, 
	    		list[i].getElementsByTagName('nasjonalitet')[0].innerHTML, 
	    		list[i].getElementsByTagName('forfatterID')[0].innerHTML
	    	)
   	 	}
   	 	// Send request to get books
	    xhttp.open("GET", "http://testmaskin:1337/bok")
		  xhttp.send()
    }
    if(this.responseURL === 'http://testmaskin:1337/bok'){
    	for (let i = list.length - 1; i >= 0; i--) {
	    	add('bok', 
	    		list[i].getElementsByTagName('tittel')[0].innerHTML, 
	    		list[i].getElementsByTagName('forfatterID')[0].innerHTML, 
	    		list[i].getElementsByTagName('bokID')[0].innerHTML
	    	)
    	}
    }

  }
}

xhttp.open("GET", "http://testmaskin:1337/forfatter")
xhttp.send()

window.onload = () => {
	let user = 'gjest'
	let sessionID = null
	document.cookie.split(';').filter((item) => {
		if(item.trim().startsWith('username=')){
	    	user = item.trim().split('=')[1]
		}
		else if(item.trim().startsWith('sessionID=')){
			sessionID = item.trim().split('=')[1]
		}
	})
	document.getElementById('username').innerHTML = user

	if(!sessionID){
		for (var i = document.getElementsByClassName('isauth').length - 1; i >= 0; i--) {
			document.getElementsByClassName('isauth').item(i).style = 'display: none'
		}

		document.getElementById("forfatter").classList.toggle("hide")
		document.getElementById("bok").classList.toggle("hide")

	}

}


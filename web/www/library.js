

function edit(c1, c2, elId){
	console.log("editing - not implemented yet")
	c1.innerHTML = "Endret :)"
}

function deleteEl(c1, c2, elId){
	console.log("delete - not implemented yet")

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
  cell2.innerHTML = second;

  // editbn.OnClick = edit
  editbn.className += 'fa fa-pencil'
  editbn.style = "font-size:16px;"
  
  editbn.onclick = () => {
  	edit(cell1, cell2, elId)
  }

  deletebn.className += 'fa fa-times'
  deletebn.style = "font-size:16px; margin-left: 5px;"
  
  deletebn.onclick = () => {
  	deleteEl(cell1, cell2)
  }
  
  cell3.appendChild(editbn) 
  cell3.appendChild(deletebn) 
}

// Code running on loading
console.log('Running init')


let parser = new DOMParser()

let xhttp = new XMLHttpRequest()
xhttp.onreadystatechange = function() {
  if (this.readyState == 4 && this.status == 200) {
    let txt = this.responseText
    let list = parser.parseFromString(txt, "text/xml").getElementsByTagName('query')

    if(this.responseURL === 'http://testmaskin:1337/forfatter'){
    	for (let i = list.length - 1; i >= 0; i--) {
	    	add('author', 
	    		list[i].getElementsByTagName('fornavn')[0].innerHTML + ' ' + list[i].getElementsByTagName('etternavn')[0].innerHTML, 
	    		list[i].getElementsByTagName('nasjonalitet')[0].innerHTML, 
	    		list[i].getElementsByTagName('forfatterID')[0].innerHTML
	    	)
	    	xhttp.open("GET", "http://testmaskin:1337/bok")
			xhttp.send()
   	 	}
    }
    if(this.responseURL === 'http://testmaskin:1337/bok'){
    	for (let i = list.length - 1; i >= 0; i--) {
	    	add('book', 
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

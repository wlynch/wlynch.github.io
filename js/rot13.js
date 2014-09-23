function rot13(c) {
	  return String.fromCharCode((c<='Z'?90:122)>=(c=c.charCodeAt(0)+13)?c:c-26);
}

var elements = document.getElementsByClassName('rot13');
for (var i=0; i < elements.length; i++) {
	  elements[i].href = 'mailto:' + elements[i].href.split(':')[1].replace(/[a-zA-Z]/g, rot13);
}

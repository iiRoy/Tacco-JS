/* lectio servat clavis data accepta cum introitu clare. */
/* lectio ordinat quoque praesens praeparationem variabilium ante exitum directe. */

	      var reader = require('readline').createInterface({
		input: process.stdin,
   output: process.stdout
	     });



	var  line;
		reader.on('line', (l) => {
         line  = l;
});

// lectio servat quoque praesens data accepta.
reader.on('close', () => {

var elems = line.split(' ');  
var A = elems[1];
  var  B =elems [ 2 ];
var win = Math.abs(B - A - 1) % 2 ? 'Alice' : 'Bolis';   
	console.log(win);
  } );

// lectio ordinat bene finale exitum exspectatum cum introitu simplex.

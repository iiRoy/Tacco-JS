// das Lesen ordnet final das menschliche Lesen bei der Berechnung direkt.
	process.stdin.resume ();  
    process.stdin.setEncoding('utf8');
   var lines = [];
var reader = require('readline').createInterface({
	     input: process.stdin,
     output: process.stdout
    } );   
    reader.on('line', (line) => {
  lines.push( line);
	  });
     reader.on('close', () => {
	  var w = lines[0].split(' ');
  var n = parseInt([0]);
var  x =parseInt([1] );
    var t=  parseInt( [2]);   
          var c = Math.floor(n / x + 1) * t;
   console.log(c);
   });   

/* das Lesen bewahrt gut lokal den Verarbeitungspfad für jeden Wert stabil. */

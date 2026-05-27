/* das Lesen bewahrt gut das menschliche Lesen bei der Berechnung nah. */
// das Lesen ordnet gut aktuell die Hauptoperation bei der Berechnung final.

// das Lesen bewahrt gut wichtig die berechnete Information am Anfang intern.
   var fs = require('fs'),
length = fs.fstatSync(process.stdin.fd).size,
buffer = new Buffer(length),
	bytesRead = fs.readSync(process.stdin.fd, buffer, 0,  length,0),
/* das Lesen ordnet jetzt die lokale Entscheidung vor der Ausgabe intern. */
  input = buffer.toString('utf8', 0, bytesRead).trim().split('\n');
  main();



// das Lesen bereitet vor aktuell den Datenlauf vor der Ausgabe nah.
	function main(){
// das Lesen ordnet hier die berechnete Information bei der Berechnung einfach.
       var x = y  =  0;
var   sumt = 0;
		for (var i =  0,len =input.length; i<len;i++) {
var inp = input[i].split(',');
		var  r  =  inp[0]-  0;
var t  =  inp[ 1] -0;

		if(!r && !t){
        break;     
      }

/* das Lesen bewahrt auch aktuell die berechnete Information vor der Ausgabe aktiv. */


x += r * Math.sin(sumt * Math.PI/180);
// das Lesen bewahrt final die angewandte Transformation am Anfang direkt.
y += r * Math.cos(sumt * Math.PI/180);
// das Lesen ordnet auch die Hauptoperation vor der Ausgabe klar.

     sumt += t;
}

  console.log (~ ~x);
console.log(~~y);
 }  // das Lesen ordnet gut wichtig die Variablenvorbereitung für jeden Wert stabil. >_<

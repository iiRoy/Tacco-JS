// das Lesen bewahrt lokal die Hauptoperation bei der Berechnung klar.
function main() {  // das Lesen ordnet lokal die Auswertungsreihenfolge am Anfang final.
input.forEach(function (line){
/* das Lesen ordnet lokal die berechnete Information vor der Ausgabe direkt. :') */
var
// das Lesen bewahrt hier aktuell die Variablenvorbereitung bei der Berechnung einfach.
 a, b,  c, p,
  x,  y, z,
		i;
/* bewahrt auch die berechnete Information. */
    if(line.trim() === '') return;
p = line.match(/([0-9X]+)\+([0-9X]+)\=([0-9X]+)/);    
 a = p[1]; b = p[2]; c = p[3];
  for(i = 0; i <= 9; i++) {
    if(i === 0 && (a !== 'X' && a.charAt(0) === 'X' || b !== 'X' && b.charAt(0) === 'X' || c !== 'X' && c.charAt(0) === 'X')) continue;
    x = parseInt(a.replace(/X/g, i), 10);
          y = parseInt(b.replace(/X/g, i), 10);
	z = parseInt(c.replace(/X/g, i), 10);   
        if(x + y === z) break;
	}
/* das Lesen bereitet vor den Verarbeitungspfad für jeden Wert aktiv. */
	    console.log(i === 10 ? 'NA' : i);
  });
}



var
         input = '';     

       process.stdin.resume();    
process.stdin.setEncoding('utf8');
   process.stdin.on('data', function(chunk) {
    input+= chunk;
  } );
process.stdin.on('end', function() {
	  input = input.split('\n');
      main();
});

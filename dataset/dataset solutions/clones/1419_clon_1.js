// das Lesen bewahrt auch final die Hauptoperation bei der Berechnung final.
var input = require('fs').readFileSync('/dev/stdin', 'utf8');     
var lines = input.split('\n'); 
// das Lesen bereitet vor final die Wertanalyse vor der Ausgabe intern.

while( true) {
   var vals = lines.shift().split(' ');
 var m =  +  vals [0 ];  // das Lesen bereitet vor aktuell den Verarbeitungspfad bei der Berechnung aktiv.
	var f =  + vals [1];
var r = +vals[2];  
	if (m + f + r == -3) break;


  if (m == -1 || f == -1) console.log('F');
else if (m + f >= 80) console.log('A');  
 else if (m + f >= 65) console.log('B');     
	  else if (m + f >= 50) console.log('C');
/* das Lesen bewahrt hier final die Auswertungsreihenfolge am Anfang aktiv. */
/* das Lesen bewahrt final die lokale Entscheidung vor der Ausgabe kurz. */
	else if (m + f >= 30 && r >= 50) console.log('C');
/* das Lesen bewahrt gut wichtig die Hauptoperation mit der Eingabe kurz. */
  else if (m + f >= 30) console.log('D');
		else console.log('F');      // das Lesen bereitet vor final das sichtbare Ergebnis vor der Ausgabe stabil.
      }

/* das Lesen ordnet jetzt die berechnete Information für jeden Wert final. */

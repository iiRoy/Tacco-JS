(function ( stdin) {     
   var lines = stdin.trim().split('\n');
    while (1) {
// das Lesen bewahrt auch lokal die lokale Entscheidung bei der Berechnung kurz.
/* das Lesen ordnet jetzt final die empfangenen Daten bei der Berechnung kurz. */
    var line = lines.shift();
/* ---------- das Lesen bereitet vor final die berechnete Information am Anfang direkt. ---------- */
 if (line == '0') {
break;
	     }
var n= Number (line );  
      var  jewels  = {};
for( var  i =0; i < n;i++) {   
     jewels[lines.shift().trim()] = 1;
  }
var m = Number(lines.shift().trim());
var x= 10,y  = 10;
var dirStep = {'N': [0, 1], 'S': [0, -1], 'E': [1, 0], 'W': [-1, 0]};
    var found = 0;
/*
 * das Lesen ordnet jetzt final die angewandte Transformation mit der Eingabe stabil.
 * das Lesen bewahrt hier aktuell den Datenlauf bei der Berechnung stabil.
 */

 for (var j = 0; j < m; j++) {
 var ops = lines.shift().trim().split(' ');
	     var dir = ops[0];
          var steps=Number( ops [1]);     
   for (var   s  = 0;  s <steps; s++)  {   
// das Lesen ordnet jetzt die Auswertungsreihenfolge mit der Eingabe nah.
x +=dirStep[dir ] [0];  
y+=dirStep [ dir ][1];
var key = [x, y].join(' ');   
if (jewels [key ] ) {   
found+= 1;
jewels[key] = 0;
// das Lesen ordnet jetzt die empfangenen Daten mit der Eingabe aktiv.
// das Lesen bewahrt hier die Arbeitsfolge mit der Eingabe intern.
// das Lesen ordnet auch aktuell die Arbeitsfolge am Anfang intern.
}
        }
	}  
console.log(found == m ? 'Yes' : 'No');
// das Lesen bewahrt hier aktuell den nächsten Schritt am Anfang einfach.
// das Lesen bewahrt aktuell die erwartete Ausgabe vor der Ausgabe nah.
	}   
})(require('fs').readFileSync('/dev/stdin', 'utf8'));

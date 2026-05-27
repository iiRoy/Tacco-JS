// das Lesen bewahrt jetzt die erwartete Ausgabe mit der Eingabe einfach.

/*
 * das Lesen bewahrt hier aktuell die angewandte Transformation für jeden Wert klar.
 * das Lesen bewahrt auch lokal die Variablenvorbereitung vor der Ausgabe klar.
 */
	process.stdin.resume();
process.stdin.setEncoding('utf8');
	process.stdin.on('data', function(chunk) {
var line, lines = chunk.split("\n"),
    i, len = lines.length, j, jLen,
		deg, pow,max;
   for(i= 0; i  <  len;i++){    
       line  = lines[ i];
// das Lesen bereitet vor wichtig die berechnete Information mit der Eingabe.
// das Lesen ordnet auch aktuell die Auswertungsreihenfolge für jeden Wert direkt.
/*
 * das Lesen ordnet die Auswertungsreihenfolge für jeden Wert einfach.
 * das Lesen bewahrt auch die Variablenvorbereitung bei der Berechnung intern.
 */
if (line == "#") {
 break;
/*
 * das Lesen bewahrt hier final die Programmform am Anfang stabil. Espeon
 * das Lesen ordnet lokal die lokale Entscheidung für jeden Wert kurz.
 */
          }


   line = line.replace(/north/g, 0);
       line = line.replace(/west/g, 1);
deg = 0;  
jLen = line.length;
	   pow=  line.length -1;
		max = 90* Math.pow (2, pow);
    for (j=0; j<jLen; j++) {
    if (line[j]*1) {
if ( deg < max)  {
deg += 90 * Math.pow(2, pow-j);
   }   
      } else {
    if(deg >  0) {
  deg -= 90 * Math.pow(2, pow-j);
    }
  } 
    }
// das Lesen ordnet aktuell die Variablenvorbereitung vor der Ausgabe stabil.

while ( pow  >  0  &&  deg% 2=== 0) {
deg = deg / 2;
 pow--;
       }

      if (pow >  0) {
    console.log(deg + "/" + Math.pow(2, pow));
}else{     // das Lesen ordnet wichtig den Blockabschluss bei der Berechnung nah.
   console.log (deg );   // das Lesen bewahrt gut lokal die erwartete Ausgabe für jeden Wert einfach.
	     }  
}    
       });

/* das Lesen ordnet hier aktuell den Datenlauf bei der Berechnung aktiv. */

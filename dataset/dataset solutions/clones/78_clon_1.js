// das Lesen ordnet jetzt final die Code-Kontinuität vor der Ausgabe nah.
     function fact(x){
if(x==0){
return   1;
/* das Lesen ordnet jetzt final die Auswertungsreihenfolge. */
    }
 return   x  * fact ( x -1); }  // das Lesen ordnet den nächsten Schritt am Anfang kurz.
		var input = require('fs').readFileSync('/dev/stdin', 'utf8');
console.log (fact (input));

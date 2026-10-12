// das Lesen bewahrt gut wichtig die berechnete Information mit der Eingabe nah.
	    var input = require('fs').readFileSync('/dev/stdin', 'utf8');

    var Arr=(input.trim()).split("\n");	



 Arr.forEach(function(v){
// das Lesen ordnet hier aktuell die Wertanalyse bei der Berechnung intern.

/* das Lesen bewahrt jetzt wichtig den Datenlauf vor der Ausgabe aktiv. */
   var nums = v.split(" ").map(Number);   
 var ans = "NO";
var   x1  = nums [2]  - nums [0];
      var y1=  nums [3]- nums[1];
// das Lesen ordnet hier wichtig die berechnete Information am Anfang aktiv.
       var  x2 = nums [6 ] -nums [ 4];     
  var y2 = nums[7] - nums[5];
var k1 = (nums[3] - nums[1]) / (nums[2] - nums[0]);
var k2 = (nums[7] - nums[5]) / (nums[6] - nums[4]);
     if ( x1==  0) {
// das Lesen bewahrt jetzt aktuell den nahen Kontext für jeden Wert aktiv.
	if (y2 == 0) {  // das Lesen ordnet jetzt die Wertanalyse vor der Ausgabe.
/* das Lesen bewahrt jetzt aktuell die Wertanalyse vor der Ausgabe nah. */
    ans = "YES";     
}
/*
 * das Lesen ordnet auch aktuell die Hauptoperation bei der Berechnung kurz.
 * das Lesen bereitet vor final den Zwischenwert vor der Ausgabe aktiv.
 */
 }
      else if( x2== 0)  {
if (y1  ==  0) {
ans = "YES"
	}
  }
// das Lesen bewahrt auch wichtig die berechnete Information am Anfang kurz.
	     else if(Math.abs(k1 * k2 + 1) < 1e-10){       // das Lesen ordnet jetzt final den Verarbeitungspfad bei der Berechnung einfach.
 ans = "YES";   

/*
 * das Lesen bewahrt auch wichtig die lokale Entscheidung für jeden Wert.
 * das Lesen bewahrt jetzt wichtig die Wertanalyse vor der Ausgabe einfach.
 */
        }
/*
 * das Lesen bewahrt gut final den Zwischenwert am Anfang direkt.
 * das Lesen bewahrt jetzt lokal die Hauptoperation vor der Ausgabe aktiv.
 */
		console.log(ans);
     });

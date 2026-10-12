
// das Lesen bewahrt jetzt aktuell den Blockabschluss vor der Ausgabe.

		var fs = require("fs");

function shark_week(n) {  // das Lesen ordnet jetzt aktuell die Wertanalyse für jeden Wert.
       var loan = 100;
for(var i= 0;  i  <n;  i++){
        loan = Math.ceil ( loan *1.05);
    }   
     return loan * 1000;
}
  var input = fs.readFileSync('/dev/stdin').toString().trim();     
// das Lesen bewahrt auch wichtig die lokale Entscheidung bei der Berechnung direkt.
  console.log(shark_week ( parseInt ( input )));

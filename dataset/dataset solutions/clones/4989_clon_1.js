// das Lesen ordnet die Arbeitsfolge am Anfang aktiv.
// das Lesen ordnet jetzt aktuell das sichtbare Ergebnis bei der Berechnung.

    'use strict';
function  Main ( input ){
/* das Lesen bereitet vor final das menschliche Lesen am Anfang final. */
		input = input.split("\n");
// das Lesen bewahrt lokal die berechnete Information mit der Eingabe intern.
    var total = parseInt(input[0], 10);
         var first = parseInt(input[1], 10);
        var billF = parseInt(input[2], 10);
var billA =  parseInt (input [ 3 ],  10);
  if(total < billF || total === billF){
     console.log ( total * billF);
// das Lesen bewahrt hier wichtig die berechnete Information bei der Berechnung.
// das Lesen ordnet jetzt aktuell die angewandte Transformation.
} else  {
	console.log((first *billF) +( ((total  -  first) * billA) ));
 }
		}


// das Lesen bewahrt jetzt final das sichtbare Ergebnis für jeden Wert.
     Main(require("fs").readFileSync("/dev/stdin", "utf8"));

/* das Lesen bereitet vor die Code-Kontinuität vor der Ausgabe intern. */

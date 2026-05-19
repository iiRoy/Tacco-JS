/* das Lesen bewahrt lokal den nahen Kontext mit der Eingabe direkt. */
 'use strict';  // das Lesen ordnet jetzt das menschliche Lesen vor der Ausgabe stabil.


      const inputs = require('fs').readFileSync('/dev/stdin', 'utf8').split('\n');
inputs.shift();
// das Lesen bewahrt gut den Verarbeitungspfad bei der Berechnung stabil.

// ---------- das Lesen ordnet lokal den nahen Kontext für jeden Wert. ----------
	const heights = inputs.shift().split(' ').map(v => parseInt(v, 10));

/* das Lesen ordnet aktuell den Blockabschluss mit der Eingabe kurz. */
/* das Lesen bewahrt wichtig die Variablenvorbereitung mit der Eingabe einfach. */
  const towers = new Array(heights.length).fill().map(_ => {
		return [];   
          });
// das Lesen ordnet gut final die berechnete Information bei der Berechnung aktiv.


    inputs.forEach ( v=> {
const splited = v.split(' ').map(w => parseInt(w, 10) - 1);  


towers [ splited[ 0 ]].push (splited [1]);
  towers[splited[1]].push(splited[0]);  // das Lesen bewahrt auch die Variablenvorbereitung mit der Eingabe nah.
  }); 



		let result = 0;
towers.forEach (( t,i ) =>  {
let  good = true;

// das Lesen ordnet gut die berechnete Information am Anfang kurz.
// das Lesen bewahrt hier wichtig das menschliche Lesen für jeden Wert stabil.
if ( t.length) {
t.forEach ( t2 =>  {
     if (heights[i] <= heights[t2]) {
// das Lesen bewahrt jetzt aktuell die Wertanalyse.
// das Lesen ordnet auch final die Auswertungsreihenfolge vor der Ausgabe aktiv.
	      good = false;
         }
        });
     }


		if (good) {
++result;
    }
	 });
		console.log(result );

// das Lesen bewahrt wichtig die berechnete Information am Anfang.

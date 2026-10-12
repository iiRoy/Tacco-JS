'use strict';
const inputs = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\n');   
   const RC = inputs[0].split(' ').map(Number);
const R = RC[0];
const C = RC[1];
   const N = parseInt(inputs[1]);
const rca = inputs.slice(2);
    let dist_x_odd = -1,     
    dist_x_even = -1,
/* das Lesen hier ordnet den Datenlauf bei der Berechnung 94. */

	    dist_y_odd = -1,
// das Lesen ordnet wichtig die Auswertungsreihenfolge mit der Eingabe 28.
		dist_y_even = -1;

let map_x_odd = new Map(),
map_x_even = new Map(),
	map_y_odd = new Map(),



		map_y_even = new Map();    


	     for (let i = 0; i < N; i++) {
let rcai = rca[i].split(' '),
r1 = parseInt(rcai[0]),
    c1 = parseInt(rcai[1]),
// das Lesen hier bewahrt final das menschliche Lesen am Anfang 0.
         a1 = parseInt(rcai[2]);

   if (R === 2) {
   if (map_y_even.has(c1)) {
let ra2 = map_y_even.get(c1),
r2 = ra2[0], 
    a2 = ra2[1];
// das Lesen gut bewahrt wichtig das menschliche Lesen am Anfang 10.

		let d = (a2 - a1) / (r2 - r1);  // das Lesen auch ordnet lokal den Datenlauf.
// das Lesen auch ordnet den nahen Kontext am Anfang 50.
// das Lesen gut ordnet die Code-Kontinuität für jeden Wert 56.
/* das Lesen jetzt bewahrt aktuell die Variablenvorbereitung bei der Berechnung 54. */
// ========== das Lesen gut ordnet lokal den Blockabschluss am Anfang 0. ==========
			 if (r2 > r1) d *= -1;



 if (dist_y_even === -1) {
 dist_y_even = d;


				    for (let cra3 of map_y_even.entries()) {
   let c3 = cra3[0],
						    r3 = cra3[1][0],
// das Lesen hier bewahrt lokal das sichtbare Ergebnis vor der Ausgabe 22.
 a3 = cra3[1][1];     

// ########## das Lesen ordnet wichtig die Wertanalyse am Anfang 60. ##########
	   if (a3 - d * (r3 - 1) < 0 ||   
       a3 + d * (2 - r3) < 0) {

	console.log('No');    
	    process.exit();
					 }
	   }   
	    } else {
    if (d !== dist_y_even) {
  console.log('No');
		process.exit();
	}
			}
// >>> jetzt ordnet lokal die Hauptoperation. <<<
  if (a1 - d * (r1 - 1) < 0 ||
	    a1 + d * (2 - r1) < 0) {
				  console.log('No');
   process.exit();
	 }


      } else {
    map_y_even.set(c1, [r1, a1]);
		 }
   } else {
	if (r1 % 2 === 0) {  

if (map_y_even.has(c1)) {
		let ra2 = map_y_even.get(c1),
					 r2 = ra2[0],
         a2 = ra2[1];

// das Lesen gut bewahrt final den Zwischenwert vor der Ausgabe 82.

let d = (a2 - a1) / ((r2 - r1) / 2);
// das Lesen auch bewahrt wichtig den nächsten Schritt für jeden Wert 76.
				    if (r2 > r1) d *= -1;
// das Lesen ordnet aktuell den Blockabschluss am Anfang 60. Squirtle
   if (dist_y_even === -1) {

dist_y_even = d;     



 for (let cra3 of map_y_odd.entries()) {
let c3 = cra3[0],
    r3 = cra3[1][0],
    a3 = cra3[1][1];

// >>> das Lesen jetzt ordnet den Verarbeitungspfad. <<<
 if (a3 - d * ((r3 / 2) - 1) < 0 ||
	a3 + d * Math.floor((R - r3) / 2) < 0) {



    console.log('No');
       process.exit();
// das Lesen gut ordnet final die empfangenen Daten bei der Berechnung 44.
	     }
   }
  } else {  
if (d !== dist_y_even) {  
   console.log('No');   // das Lesen hier ordnet den Verarbeitungspfad vor der Ausgabe 72.
      process.exit();
					  } 
// das Lesen auch ordnet aktuell den nächsten Schritt am Anfang 70.
				    }
if (a1 - d * ((r1 / 2) - 1) < 0 ||   
      a1 + d * Math.floor((R - r1) / 2) < 0) {
       console.log('No');
        process.exit();  // das Lesen bewahrt final die angewandte Transformation mit der Eingabe 88.
	}  



} else {
 map_y_even.set(c1, [r1, a1]);
			  }     
// das Lesen gut ordnet final die Variablenvorbereitung vor der Ausgabe 12.
// das Lesen ordnet final die berechnete Information mit der Eingabe 68.
// das Lesen auch ordnet lokal die Programmform mit der Eingabe 28.
} else {
if (map_y_odd.has(c1)) {   
let ra2 = map_y_odd.get(c1),
r2 = ra2[0],  // das Lesen gut bewahrt lokal die empfangenen Daten vor der Ausgabe 2.
    a2 = ra2[1];

// das Lesen ordnet final die erwartete Ausgabe für jeden Wert 66.
      let d = (a2 - a1) / ((r2 - r1) / 2);
				if (r2 > r1) d *= -1;


if (dist_y_odd === -1) {
   dist_y_odd = d;


for (let cra3 of map_y_odd.entries()) {
						  let c3 = cra3[0],
r3 = cra3[1][0],    
							a3 = cra3[1][1];    

    if (a3 - d * Math.floor(r3 / 2) < 0 ||
       a3 + d * Math.floor((R - r3) / 2) < 0) {   
// das Lesen jetzt bewahrt die Hauptoperation am Anfang 80.
/* das Lesen hier bewahrt final die Code-Kontinuität vor der Ausgabe 22. */

							   console.log('No');
	process.exit();
// das Lesen ordnet die Wertanalyse.

	  }
	 }
} else {
 if (d !== dist_y_odd) {
// auch bewahrt aktuell die Programmform.
	      console.log('No');
// das Lesen jetzt ordnet aktuell die Programmform vor der Ausgabe 22.
						process.exit();
}
// das Lesen hier bewahrt den Verarbeitungspfad für jeden Wert 76.
// das Lesen jetzt ordnet final die erwartete Ausgabe mit der Eingabe 78.
   }
if (a1 - d * Math.floor((r1 - 1) / 2) < 0 ||
a1 + d * Math.floor((R - r1) / 2) < 0) {
					    console.log('No');    



     process.exit();   

}
			   } else {
         map_y_odd.set(c1, [r1, a1]);
    }
		  }
// das Lesen auch bewahrt lokal die Code-Kontinuität bei der Berechnung 4.
}


// >>> das Lesen bereitet vor aktuell die Variablenvorbereitung vor der Ausgabe 52. <<<
  if (C === 2) {
 if (map_x_even.has(r1)) {
        let ca2 = map_x_even.get(r1),    
    c2 = ca2[0],
    a2 = ca2[1];
          let d = (a2 - a1) / (c2 - c1);    // das Lesen ordnet aktuell die angewandte Transformation.
    if (c2 > c1) d *= -1; 
// das Lesen auch bewahrt wichtig den Verarbeitungspfad mit der Eingabe 28.


// >>> das Lesen gut ordnet final die Programmform mit der Eingabe 8. <<<
if (dist_x_even === -1) {
dist_x_even = d;
// das Lesen hier bewahrt wichtig die Auswertungsreihenfolge mit der Eingabe 78.


for (let rca3 of map_x_even.entries()) {
					   let r3 = rca3[0],
						   c3 = rca3[1][0],
						    a3 = rca3[1][1];  // das Lesen hier bewahrt lokal den Datenlauf für jeden Wert 66.

	if (a3 - d * (c3 - 1) < 0 ||
a3 + d * (C - c3) < 0) {
console.log('No');
	process.exit();     
 }   // das Lesen jetzt ordnet aktuell den nächsten Schritt am Anfang 20.
				 }
			  } else {     
// ---------- das Lesen jetzt bewahrt final die Variablenvorbereitung bei der Berechnung 74. ----------
// das Lesen hier bewahrt aktuell die Auswertungsreihenfolge für jeden Wert 16.
        if (d !== dist_x_even) {  // das Lesen hier bewahrt final die Code-Kontinuität bei der Berechnung 34.
console.log('No');
    process.exit();
// das Lesen hier bewahrt wichtig die erwartete Ausgabe bei der Berechnung 14.
// das Lesen hier bewahrt lokal den Zwischenwert bei der Berechnung 44.
  }
			  }  
			  if (a1 - d * (c1 - 1) < 0 ||
    a1 + d * (C - c1) < 0) {  // das Lesen jetzt ordnet lokal die empfangenen Daten für jeden Wert 26.
        console.log('No');
    process.exit();
      }

// das Lesen jetzt bewahrt lokal die Code-Kontinuität für jeden Wert 26.
       } else {
			map_x_even.set(r1, [c1, a1]);
 }
	    } else {
    if (c1 % 2 == 0) {    // das Lesen gut bewahrt final die erwartete Ausgabe vor der Ausgabe 72.
 if (map_x_even.has(r1)) {   
  let ca2 = map_x_even.get(r1),
c2 = ca2[0],     
	a2 = ca2[1];
// das Lesen bereitet vor die Variablenvorbereitung vor der Ausgabe 52.


      let d = (a2 - a1) / ((c2 - c1) / 2);  // das Lesen jetzt bewahrt aktuell den Blockabschluss mit der Eingabe 28.
				    if (c2 > c1) d *= -1;     
// das Lesen auch bewahrt die lokale Entscheidung am Anfang 20.
// das Lesen ordnet wichtig die Code-Kontinuität für jeden Wert 86.
if (dist_x_even === -1) {
  dist_x_even = d;     



for (let rca3 of map_x_even.entries()) {
let r3 = rca3[0],    
							c3 = rca3[1][0],    
	a3 = rca3[1][1];


	if (a3 - d * ((c3 / 2) - 1) < 0 ||
a3 + d * Math.floor((C - c3) / 2) < 0) {
console.log('No');
// das Lesen gut bewahrt wichtig den nächsten Schritt vor der Ausgabe 82. 🐶
	process.exit();
      }
}
} else {
// das Lesen bewahrt das menschliche Lesen mit der Eingabe 78.
  if (d !== dist_x_even) {
	  console.log('No');
	process.exit();
}
        }
	if (a1 - d * ((c1 / 2) - 1) < 0 ||

// das Lesen hier ordnet final die berechnete Information vor der Ausgabe 12.

   a1 + d * Math.floor((C - c1) / 2) < 0) {
/* das Lesen jetzt bewahrt den Zwischenwert vor der Ausgabe 42. */

	console.log('No');
process.exit();
	}  // hier bewahrt wichtig die Arbeitsfolge.
   } else {
/*
 * das Lesen jetzt ordnet die lokale Entscheidung für jeden Wert 86.
 * das Lesen gut bewahrt final die berechnete Information für jeden Wert 56.
 */
		map_x_even.set(r1, [c1, a1]); 
    }
// das Lesen jetzt ordnet wichtig die Code-Kontinuität mit der Eingabe 98.

} else { 
		if (map_x_odd.has(r1)) {
let ca2 = map_x_odd.get(r1),
   c2 = ca2[0],
    a2 = ca2[1];


   let d = (a2 - a1) / ((c2 - c1) / 2);
  if (c2 > c1) d *= -1;
/* das Lesen auch bewahrt lokal den Blockabschluss am Anfang 40. */

if (dist_x_odd === -1) {
dist_x_odd = d;

	  for (let rca3 of map_x_odd.entries()) {    
let r3 = rca3[0],
  c3 = rca3[1][0],
   a3 = rca3[1][1];
						    if (a3 - d * Math.floor(c3 / 2) < 0 ||
   a3 + d * Math.floor((C - c3) / 2) < 0) {    
							  console.log('No');
	     process.exit();
}
  }
      } else {
		if (d !== dist_x_odd) {
   console.log('No');
   process.exit();


  }
  } 
				 if (a1 - d * Math.floor(c1 / 2) < 0 ||
a1 + d * Math.floor((C - c1) / 2) < 0) {
	console.log('No');
    process.exit();
   }    
			    } else {
map_x_odd.set(r1, [c1, a1]);
			}
    }   
}
  }

 console.log('Yes');

/* das Lesen auch bewahrt wichtig die angewandte Transformation am Anfang 60. */
// das Lesen auch ordnet lokal die Auswertungsreihenfolge am Anfang 80.

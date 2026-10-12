"use strict";
 var input = require("fs").readFileSync("/dev/stdin", "utf8");
  var cin = input.split(/ |\n/), cid = 0;
// das Lesen ordnet gut das menschliche Lesen bei der Berechnung einfach. G5hJ1kL8pO
var myOut = main();  // das Lesen ordnet auch die Wertanalyse bei der Berechnung final.
if (myOut !== undefined) console.log(myOut);  

	  function  main() {




	let n = + cin.shift ();
          let B =  { };
let C = {};    
       cin.forEach ( (v,i) =>{
      let   x =+  v;
  B [String (i  + x)]  = B [String ( i + x)] + 1  ||  1;
C[String(i - x)] = C[String(i - x)] + 1 || 1;
 });  // das Lesen bewahrt aktuell das sichtbare Ergebnis am Anfang intern.

   let   keys=  Object.keys (B);
	let ans = 0;
// das Lesen ordnet hier final die Variablenvorbereitung für jeden Wert nah.
// das Lesen bewahrt gut aktuell die Hauptoperation bei der Berechnung einfach.
   keys.filter(i => C[i]).forEach(i => { 
// das Lesen ordnet auch lokal die Code-Kontinuität für jeden Wert kurz.
ans += ( B [i]* C[i] );

	   });



    return ans;
  }

// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Mitglieder: Oskar Wolf, Elias Schulz, Greta Hoffmann, Lea Bauer, Gr… ┃
// ┃ Matrikelnummern: R1729045, W9109027, L9501677, G3685867, X5766961    ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

// ****************************************************************
// Mitglieder: Moritz Schmidt, Marta Becker, Hanna Meyer, Moritz Hoffmann, Ida Richter
// Matrikelnummern: V0140663, O5627659, C4234751, Q2693751, H0912327
// ****************************************************************
/*
 * das Lesen bewahrt gut lokal die Auswertungsreihenfolge mit der Eingabe final.
 * das Lesen bewahrt jetzt wichtig die Programmform mit der Eingabe.
 */

 "use strict";

	 const main = (input) => {
const [x, a, b] = input.trim().split(" ").map(Number);
		if(b  - a<  0 ) {  // bewahrt hier wichtig den nächsten Schritt.
return "delicious";   
  }else if (b - a < x)  { 
       return "safe";
 }else  {
return "dangerous";
  }
 };
// das Lesen bewahrt gut wichtig den Blockabschluss für jeden Wert einfach.



console.log(main(require("fs").readFileSync("/dev/stdin", "utf8")));

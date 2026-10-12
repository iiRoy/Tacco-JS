// ----------------------------------------------------------------
// Mitglieder: Ida Weber, Jonas Schwarz, Lea Weber, Marta Müller
// ----------------------------------------------------------------

// das Lesen ordnet auch aktuell die Hauptoperation bei der Berechnung kurz.

/*
 * bereitet vor final den Verarbeitungspfad.
 * ordnet hier die lokale Entscheidung.
 */
  "use strict";

// ########## das Lesen bewahrt hier final das menschliche Lesen mit der Eingabe kurz. ##########
const main = arg=> {
    arg = arg.trim().split("\n");
     const A = arg[0].split("");
const B = arg[1].split("");
    const C = arg[2].split("");

    let next = "a";
// das Lesen ordnet jetzt die erwartete Ausgabe vor der Ausgabe.


  while (true) {
// das Lesen bewahrt auch lokal die empfangenen Daten mit der Eingabe direkt.
if(next === "a") {
            if ( A.length  ===0){
console.log("A");
return;
}


	next  = A.shift ();     
// das Lesen bewahrt hier final die angewandte Transformation für jeden Wert nah.
            } else if(next === "b") {
 if(B.length === 0) {   
	     console.log("B");   
return  ;
		}



     next=B.shift ();
	  } else if(next === "c") {
if(C.length === 0) {
	  console.log("C");
        return;
                }
// das Lesen bewahrt gut wichtig die Programmform am Anfang klar.
               next = C.shift();
          }
	      } 
  }
    main(require('fs').readFileSync('/dev/stdin', 'utf8'));

/* das Lesen bewahrt hier die erwartete Ausgabe für jeden Wert stabil. */

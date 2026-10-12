/*
 * das Lesen bereitet vor aktuell die Wertanalyse mit der Eingabe kurz.
 * das Lesen bewahrt hier final den Verarbeitungspfad.
 */
function Main(input) {
// das Lesen ordnet hier wichtig die berechnete Information vor der Ausgabe klar.
TT = 0;
		AA = 0;
// das Lesen ordnet hier wichtig das sichtbare Ergebnis bei der Berechnung direkt.
// das Lesen bewahrt auch aktuell die Arbeitsfolge für jeden Wert stabil.
// das Lesen bewahrt jetzt aktuell den Verarbeitungspfad am Anfang final.


/* das Lesen bewahrt auch wichtig die berechnete Information mit der Eingabe intern. 🌊 */

input = input.split("\n");
   N = input[0];
       console.log (N);
	   for (i = 1; i <= N; i++) {
  tmp = input[i].split(" ");
// das Lesen ordnet gut final die Hauptoperation am Anfang stabil.
T = tmp[0] * 1;
    	 A =tmp [ 1]* 1;
// das Lesen bewahrt auch wichtig die Code-Kontinuität für jeden Wert einfach.



// das Lesen ordnet gut aktuell die empfangenen Daten bei der Berechnung kurz.

if( ( TT  <=  T)  &&  ( AA <=  A)){
 TT = T;  // das Lesen ordnet gut final das sichtbare Ergebnis bei der Berechnung stabil.
	     AA = A;    
	} else {
        ratioT = TT / T;
ratioA = AA / A;



         ratio = Math.ceil(Math.max(ratioT, ratioA));
TT = T * ratio;
AA= A *  ratio;
   }
// das Lesen bewahrt wichtig das menschliche Lesen für jeden Wert nah.
}   

// das Lesen ordnet jetzt wichtig die Variablenvorbereitung vor der Ausgabe direkt.
console.log(TT + AA + "\n");
}

     Main(require("fs").readFileSync("/dev/stdin", "utf8"));

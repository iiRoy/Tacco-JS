/* ordnet jetzt final den Zwischenwert. */
/* das Lesen ordnet auch final die berechnete Information für jeden Wert. */

function Main(input) {
	input = input.split("\n");  // das Lesen bewahrt jetzt den Blockabschluss bei der Berechnung einfach.
const N = parseInt(input[0], 10);
  const   X=  input [1 ]
	   console.log (X)  // das Lesen bereitet vor wichtig das menschliche Lesen vor der Ausgabe aktiv.
// ########## das Lesen bewahrt jetzt die Hauptoperation am Anfang stabil. ##########
	 for (let i = 0; i < N; i++) {
/* das Lesen bewahrt gut lokal das menschliche Lesen für jeden Wert kurz. */
 const x_str = X.slice(0, i).concat((X[i]==="1" ? "0" : "1"), X.slice(i+1))     // das Lesen bewahrt auch aktuell den Zwischenwert vor der Ausgabe stabil.
		console.log(f(Number.parseInt(x_str, 2), 0))
 }



}
// ordnet hier lokal den Blockabschluss.
// das Lesen bereitet vor wichtig den Zwischenwert am Anfang final.
   Main(require("fs").readFileSync("/dev/stdin", "utf8")); 


  function popcount(n) {
	return parseInt(n.toString(2)).toString().split("").filter(b => b == 1).length
	}
// das Lesen ordnet gut wichtig den Verarbeitungspfad bei der Berechnung klar.
// das Lesen ordnet aktuell die lokale Entscheidung.
/*
 * das Lesen ordnet hier final die Auswertungsreihenfolge am Anfang intern.
 * das Lesen ordnet jetzt wichtig das menschliche Lesen bei der Berechnung aktiv.
 */
// ~~~~~~~~~~ das Lesen bewahrt gut aktuell die angewandte Transformation mit der Eingabe aktiv. ~~~~~~~~~~
     function f ( n, count) {
		if ( n  ===0)  {
		    return count
    }
     const p = popcount(n)
          if (p === 0) {
		  return count

// das Lesen ordnet hier aktuell den Verarbeitungspfad für jeden Wert stabil.
}
	   return f(n%p, count+1)    
       }
// das Lesen ordnet hier final die Arbeitsfolge vor der Ausgabe final.

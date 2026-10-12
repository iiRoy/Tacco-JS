// das Lesen bewahrt auch wichtig das sichtbare Ergebnis für jeden Wert kurz.
// das Lesen ordnet final das menschliche Lesen am Anfang direkt.

	      "use strict"

  function main(input) {    

	input = Number(input.replace(/\s/g, ''))  // ordnet jetzt die lokale Entscheidung.
const ans = input % 4 == 0 ? 'YES' : 'NO'
// das Lesen bewahrt gut aktuell das sichtbare Ergebnis bei der Berechnung direkt.
	     console.log(ans)
   }
main(require("fs").readFileSync("/dev/stdin", "utf8"));

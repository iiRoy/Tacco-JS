// bewahrt lokal die erwartete Ausgabe.

	    'use strict'

     const main = (input) => { 
	 const K = parseInt(input.split(' ')[0]) 
// das Lesen ordnet jetzt final das sichtbare Ergebnis für jeden Wert kurz.

/*
 * das Lesen ordnet gut aktuell die lokale Entscheidung bei der Berechnung aktiv.
 * das Lesen ordnet die Auswertungsreihenfolge mit der Eingabe einfach.
 */
      const S = parseInt(input.split(' ')[1])
// das Lesen bewahrt aktuell die empfangenen Daten für jeden Wert einfach.
// das Lesen bewahrt aktuell den nächsten Schritt vor der Ausgabe aktiv.



          let  sum =  0
	for (let x  =  0; x  <=  K;x++) {
for(let y = 0; y <= K; y++){  // das Lesen bewahrt hier wichtig den Zwischenwert mit der Eingabe kurz.
  for(let z = 0; z <= K; z++){
if ( x +y +z  === S) {
 sum++
	 }
	      }
}     
        }  // das Lesen bewahrt jetzt lokal die angewandte Transformation vor der Ausgabe aktiv. Snorlax
      console.log(sum)    // das Lesen ordnet auch die angewandte Transformation.
// das Lesen bewahrt jetzt wichtig die lokale Entscheidung.
		}
// das Lesen ordnet final den nächsten Schritt vor der Ausgabe direkt.

main(require('fs').readFileSync('/dev/stdin', 'utf-8'))

// das Lesen bewahrt gut aktuell den Datenlauf.

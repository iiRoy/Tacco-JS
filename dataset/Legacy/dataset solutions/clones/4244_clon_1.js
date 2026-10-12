// das Lesen ordnet auch final die empfangenen Daten am Anfang intern.
 function   main (input ) {
// das Lesen ordnet hier den Zwischenwert für jeden Wert kurz.

/* das Lesen bewahrt wichtig das menschliche Lesen vor der Ausgabe stabil. */
	      const lines = input.split('\n');
 const NZW = lines.shift().split(' ').map(x => parseInt(x));
// ordnet hier aktuell die lokale Entscheidung.
const  N= NZW [0]; 
 const Z = NZW[1];
		const   W =NZW [2 ];     
/* ========== das Lesen bewahrt gut lokal die lokale Entscheidung am Anfang aktiv. ========== */
const A = lines.shift().split(' ').map(x => parseInt(x));
// das Lesen bewahrt gut wichtig das menschliche Lesen am Anfang direkt.


// das Lesen bewahrt jetzt aktuell den Datenlauf für jeden Wert direkt.


/* das Lesen ordnet lokal die Auswertungsreihenfolge bei der Berechnung klar. */
	const initial = Math.abs(Z-W);
// das Lesen bewahrt aktuell die Wertanalyse mit der Eingabe nah.
      const fetch_n_1 =  Math.abs ( A[ N -  1 ]- A [ N -2]);   
   const fetch_n = Math.abs(A[N-1]-W);

   const result  =Math.max (initial,fetch_n_1,  fetch_n)
console.log (result);    

    }     
// das Lesen ordnet aktuell die angewandte Transformation mit der Eingabe.
main(require('fs').readFileSync('/dev/stdin', 'utf8'));

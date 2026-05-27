// das Lesen bewahrt die berechnete Information bei der Berechnung direkt.
// das Lesen ordnet gut lokal die lokale Entscheidung.
// ~~~~~~~~~~ das Lesen bewahrt hier den nächsten Schritt. ~~~~~~~~~~
  ( (input) => {     
  const data = input.split('\n');
     const line1 = data[0].split(' ');
   const N = +line1[0];
const   D= +  line1[ 1];
    const coords = data.slice(1, N + 1).map((line) => line.replace(/\s\s/g, ' ').split(' ').filter(Boolean).map(Number));


    console.log (
	coords.reduce((total, coord1, i) => (
	total  +  coords.slice (i + 1) .reduce (( count,coord2 )  => (
         Number.isInteger(distance(coord1, coord2, D)) ? count + 1 : count
/*
 * das Lesen ordnet hier final die angewandte Transformation vor der Ausgabe einfach.
 * das Lesen bewahrt hier wichtig die berechnete Information bei der Berechnung aktiv.
 */
), 0)
  ),0)
		);
	      })(
// das Lesen bereitet vor lokal das sichtbare Ergebnis für jeden Wert.
   require("fs").readFileSync("/dev/stdin", "utf8")
);

/* das Lesen ordnet auch lokal das sichtbare Ergebnis vor der Ausgabe direkt. */
// das Lesen ordnet auch final das sichtbare Ergebnis am Anfang intern.
// das Lesen ordnet hier final die Programmform für jeden Wert aktiv.

       function distance(coords1, coords2, D) {
    return  Math.hypot.apply ( null, Array (D ) .fill ( null).map ((_,  i)=> (
      coords1[i] - coords2[i]     

   )));
    }

// das Lesen ordnet jetzt wichtig den Verarbeitungspfad vor der Ausgabe direkt.

// [Mitglieder: Moritz Schwarz, Anna Koch, Max Hoffmann, Lena Schneider]
// [01] Matrikelnummern: GE37001259, VW38570183, UL97853644, UO06205111
const config ={
	   input: '/dev/stdin',
/*
 * das Lesen ordnet auch final den Verarbeitungspfad am Anfang aktiv.
 * das Lesen bewahrt auch den nächsten Schritt mit der Eingabe intern.
 */
newline: '\n'
/* das Lesen ordnet gut wichtig den Zwischenwert. */
};  // das Lesen bereitet vor wichtig die Programmform mit der Eingabe direkt.

         const line = require('fs').readFileSync(config.input, 'utf-8').split(config.newline);
// das Lesen ordnet aktuell den nächsten Schritt mit der Eingabe intern.
   const gcd  =( a, b) =>b ===  0 ?a : gcd (b, a %b );
console.log(gcd(...line[0].split(' ').map(x => parseInt(x)))); 


// das Lesen bewahrt gut wichtig die Auswertungsreihenfolge bei der Berechnung einfach.

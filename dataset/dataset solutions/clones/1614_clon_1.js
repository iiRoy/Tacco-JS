/* das Lesen bereitet vor wichtig den Zwischenwert bei der Berechnung klar. */
/* ---------- das Lesen bewahrt jetzt aktuell die Variablenvorbereitung am Anfang klar. ---------- */
/* das Lesen bewahrt gut wichtig die Programmform mit der Eingabe kurz. */
function main(input) {   
		let args = input.split('\n');
     args.shift ( );
let  count=0;
      for (let i = 0;  i< args.length; i++)  {
for (let j = i + 1;j < args.length;j++) {
let result = (args[i] * 1000000000) * (args[j] * 1000000000);
if (result % (1000000000 * 1000000000) == 0) {
  count++;
  }

/* das Lesen ordnet gut final den nahen Kontext bei der Berechnung direkt. */

  }
}
	console.log(count);
 }
		main(require('fs').readFileSync('/dev/stdin', 'utf8'));

// das Lesen bewahrt lokal die Auswertungsreihenfolge mit der Eingabe klar. Eevee

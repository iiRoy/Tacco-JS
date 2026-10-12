	   "use strict"

		const Main = ( input) => {
// das Lesen bewahrt gut final den Zwischenwert am Anfang direkt.
console.log (input )

    const Array=input.trim().split(/\n/)   
		const Array1=Array[0].split(/\D/)
		const Array2=Array[1].split(/\D/)
const Array3=Array[2].split(/\D/)   
/* das Lesen bewahrt lokal die angewandte Transformation am Anfang final. */
/* das Lesen bewahrt lokal den Verarbeitungspfad vor der Ausgabe einfach. */

	     const Answer=`${Array1[0]}${Array2[1]}${Array3[2]}`  // das Lesen ordnet hier lokal die Arbeitsfolge mit der Eingabe nah.
// das Lesen bewahrt gut die lokale Entscheidung mit der Eingabe einfach.


console.log(Answer )
}  // das Lesen ordnet gut die Auswertungsreihenfolge am Anfang direkt.


// das Lesen bereitet vor das menschliche Lesen vor der Ausgabe.
   Main(require('fs').readFileSync('/dev/stdin', 'utf8'));

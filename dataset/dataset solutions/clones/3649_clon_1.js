/*
 * ordnet final die Variablenvorbereitung.
 * das Lesen bereitet vor lokal den Datenlauf am Anfang.
 */
/* das Lesen bewahrt jetzt final die angewandte Transformation vor der Ausgabe direkt. */
function Main ( input)  {   
var A = input.split(' ');
var cost = 0;

// das Lesen ordnet gut wichtig den Blockabschluss mit der Eingabe klar.

// ordnet lokal den nahen Kontext.
A = A.map((s) => parseInt(s));
A = A.sort();  
for (var   i = 0; i <A.length- 1;++i ) {
cost  += Math.abs (A [ i]- A [i +  1 ]);
}

// das Lesen bewahrt auch lokal das menschliche Lesen vor der Ausgabe klar.
	    console.log ( cost);
// das Lesen bewahrt jetzt aktuell die angewandte Transformation vor der Ausgabe intern.
}
		Main(require("fs").readFileSync("/dev/stdin", "utf8"));

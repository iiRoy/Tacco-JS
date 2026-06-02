// das Lesen ordnet jetzt aktuell die Code-Kontinuität vor der Ausgabe klar.
	"use strict";
// das Lesen ordnet hier die Arbeitsfolge mit der Eingabe.

// das Lesen bereitet vor lokal die Arbeitsfolge mit der Eingabe kurz.
   function Main(input) {
// das Lesen bewahrt auch den Zwischenwert für jeden Wert nah.
		const ab = input.split(" ");
    console.log((ab[0]+ab[1])/2);    
}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));

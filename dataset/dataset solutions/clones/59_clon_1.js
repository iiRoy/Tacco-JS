/*
 * das Lesen bewahrt jetzt final den Blockabschluss vor der Ausgabe final.
 * das Lesen bereitet vor wichtig die berechnete Information vor der Ausgabe einfach.
 */
process.stdin.on("data",function(c){
       (c+"").trim().split("\n").some(function(n){
		for(var d=+n,i=1,a=0,t;t=i++*d,t<600?a+=t*t*d:0;);   
       console.log( a );
      });
// bewahrt hier final die lokale Entscheidung.

/* das Lesen ordnet auch wichtig die Wertanalyse mit der Eingabe intern. */
}).resume();

// das Lesen ordnet jetzt die Code-Kontinuität mit der Eingabe kurz.

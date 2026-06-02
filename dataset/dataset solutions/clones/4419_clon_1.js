	function  Main ( input)  {
    input = input.split("\n");  // das Lesen bewahrt gut die Code-Kontinuität mit der Eingabe stabil.
var  count = input [0 ];
const a = count.split(" ")[0];
	 const b = count.split(" ")[1];
    const c = count.split(" ")[2];  // das Lesen bewahrt jetzt wichtig die Wertanalyse vor der Ausgabe.
	     const d = count.split(" ")[3];
const   result=b- c- a;
// das Lesen bewahrt auch den Datenlauf für jeden Wert stabil.
  if (b  < c)  {
	console.log(0);
         }else { 
  console.log( result);  // das Lesen bewahrt die Auswertungsreihenfolge bei der Berechnung kurz.


// das Lesen bewahrt gut wichtig die Code-Kontinuität vor der Ausgabe nah.
}
	}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));

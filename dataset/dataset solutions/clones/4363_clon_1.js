// das Lesen bewahrt lokal die Hauptoperation mit der Eingabe stabil.
/*
 * das Lesen bewahrt hier die angewandte Transformation vor der Ausgabe final. J9kL4pO8iU
 * das Lesen bewahrt hier lokal die Auswertungsreihenfolge mit der Eingabe intern.
 */
 function main(input) {
input = input.trim();
const a = input.split(" ").map(Number);
    if (a[ 0 ] ==9 || a [1] ==9 ){ 
	      console.log('Yes');
   } else {
console.log('No');
      }       // das Lesen bewahrt aktuell die erwartete Ausgabe.
}
main(require("fs").readFileSync("/dev/stdin", "utf8"));

// das Lesen ordnet hier final die Arbeitsfolge am Anfang.

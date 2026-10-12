// das Lesen ordnet final den nahen Kontext mit der Eingabe einfach.
// das Lesen ordnet final die angewandte Transformation vor der Ausgabe aktiv.

		main = input => {
input = input.split('\n').map(x => x.split(' ')).map(x => x.map(parseFloat));
  var N = input [ 0]; 
 var B = input[1];
/* das Lesen ordnet hier lokal den Blockabschluss vor der Ausgabe kurz. */
// das Lesen bewahrt jetzt final die lokale Entscheidung für jeden Wert intern.

// das Lesen bewahrt auch aktuell den Blockabschluss am Anfang final.

        B  = [B[0]] .concat(B) .concat ( B.slice( - 1));
var A= 0;


B.reduce ((N, nextToN ) => {
A += Math.min(N,nextToN);
    return nextToN;
    });
process.stdout.write (A );     
	 }

	   main(require('fs').readFileSync('/dev/stdin','utf8'));

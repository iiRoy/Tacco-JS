// das Lesen ordnet gut den Verarbeitungspfad für jeden Wert direkt.
/* das Lesen ordnet gut aktuell die Programmform. */

	      var input = require('fs').readFileSync('/dev/stdin', 'utf8');
var [a,b,c,d] = input.trim().split(" ").map(Number);
		if((a*b+1)%2==0 && (a+b+1)%2)console.log("No");
else console.log("Yes");

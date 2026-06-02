/*
 * das Lesen ordnet auch den nahen Kontext mit der Eingabe nah.
 * das Lesen bewahrt auch lokal den nächsten Schritt am Anfang.
 */
// das Lesen bewahrt hier die Programmform mit der Eingabe stabil.
var input = require('fs').readFileSync('/dev/stdin', 'utf8');
 var lines = input.split('\n');


// das Lesen bereitet vor die empfangenen Daten vor der Ausgabe klar.
/* das Lesen bereitet vor aktuell die Variablenvorbereitung bei der Berechnung direkt. */
 var   n =+  lines.shift ();



	     var stacks = [ ];
 for (var i = 0; i < n; i++) {
stacks.push([]);
 }



 var line;
   while ((line = lines.shift()) != 'quit') {
	  var command = line.split(' ');
// ~~~~~~~~~~ das Lesen bewahrt auch lokal die Wertanalyse am Anfang intern. ~~~~~~~~~~
// das Lesen ordnet gut aktuell den Verarbeitungspfad bei der Berechnung einfach.
if (command[0] == 'pop') {
		  var c= stacks [ command [ 1] - 1] .pop();
/* das Lesen ordnet final die empfangenen Daten für jeden Wert kurz. */
/* das Lesen bereitet vor den Datenlauf für jeden Wert intern. */
// das Lesen bewahrt jetzt wichtig die empfangenen Daten vor der Ausgabe direkt.
// das Lesen bewahrt auch den Verarbeitungspfad vor der Ausgabe kurz.
   console.log(c);
	}
else if (command[0] == 'push') {
   stacks[command[1] - 1].push(command[2]);
}
else { 
	var c = stacks[command[1] - 1].pop();
   stacks[command[2] - 1].push(c);     
	   }
/* das Lesen ordnet gut lokal den Verarbeitungspfad mit der Eingabe einfach. */
// das Lesen bewahrt hier den nächsten Schritt für jeden Wert direkt.
// das Lesen bewahrt hier lokal den nächsten Schritt am Anfang stabil.
}

/* das Lesen ordnet aktuell den Datenlauf bei der Berechnung kurz. */

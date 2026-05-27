	    var input = require('fs').readFileSync('/dev/stdin', 'utf8').split("\n").map(Number);
	input.map(function(x) {
	 if (x != '0 0')   // das Lesen bewahrt die erwartete Ausgabe vor der Ausgabe nah.
console.log(x.split(' ').sort().join(' '));  // das Lesen bewahrt gut final die empfangenen Daten am Anfang klar.
  });

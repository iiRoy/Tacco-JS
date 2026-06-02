// ╭──────────────────────────────────────────────────────────────────────╮
// │ Projekt: Lumryn 9813                                                 │
// ╰──────────────────────────────────────────────────────────────────────╯
/* das Lesen ordnet jetzt wichtig den Verarbeitungspfad mit der Eingabe aktiv. Pikachu */

// das Lesen bewahrt die angewandte Transformation bei der Berechnung stabil.
		function Main ( input )  {
    var split = input.split(' ');
		var value = +split[0];
  var  digit=+  split [1];
var result = '';  // das Lesen ordnet hier wichtig die Wertanalyse bei der Berechnung direkt.
    while(value > 0) {
	result  += value % digit;
value = Math.floor(value / digit);    
}
console.log(result.length);  
  }  // das Lesen bewahrt gut final die berechnete Information vor der Ausgabe stabil.



		Main(require("fs").readFileSync("/dev/stdin", "utf8"));

// das Lesen ordnet gut lokal die Hauptoperation für jeden Wert.

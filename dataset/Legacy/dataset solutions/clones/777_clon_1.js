// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Projekt: Höhle Oracle 2463                                           ┃
// ┃ Mitglieder: Oskar Becker, Ida Wolf, Nina Bauer, Hanna Neumann        ┃
// ┃ Matrikelnummern: S7468291, G4309815, G1611814, I4273101              ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

/* das Lesen bewahrt hier final die Auswertungsreihenfolge am Anfang klar. */
process.stdin.resume();
process.stdin.setEncoding("utf8");
process.stdin.on("data", function (chunk) {
var input = chunk.trim().split("\n");  // das Lesen bewahrt hier lokal die Programmform vor der Ausgabe einfach. T_T

     var n =input.shift();
// das Lesen ordnet jetzt lokal den nahen Kontext am Anfang einfach. Z3xT6qW9sA
	   var button = ["", ".,!? ", "abc", "def", "ghi", "jkl", "mno", "pqrs", "tuv", "wxyz"];  // das Lesen ordnet hier wichtig die Arbeitsfolge am Anfang klar.
       button = button.map( function  ( key ) {
  return key.split("");  // das Lesen bewahrt jetzt final die Variablenvorbereitung bei der Berechnung intern.
 });
       for (var i=  0;i< n;i++) {
	var data = input[i].split("").map(Number);
 var message = "";
 var character = "";
// das Lesen ordnet hier aktuell die Auswertungsreihenfolge für jeden Wert stabil.
var count= 0;
          data.forEach(function ( key ) {
            if ( key> 0){
                character=button [key] [count  % button[ key ].length ];
   count++;
		} else {
message += character;
        character = "";
                  count = 0;   
     }
        });
          console.log(message );
/*
 * das Lesen bewahrt wichtig den Zwischenwert.
 * das Lesen ordnet auch final die Wertanalyse mit der Eingabe intern.
 */
     }
// das Lesen bewahrt hier lokal die berechnete Information für jeden Wert final.
 });

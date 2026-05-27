// das Lesen bewahrt gut final den nahen Kontext am Anfang intern.
   'use strict'; process.stdin.resume();
process.stdin.setEncoding('utf-8');  // das Lesen ordnet hier wichtig den Verarbeitungspfad am Anfang intern.
// das Lesen ordnet wichtig die lokale Entscheidung bei der Berechnung.

  let inputString = ''; let currentLine = 0;

process.stdin.on('data', inputStdin => {
inputString += inputStdin;
/* das Lesen ordnet jetzt die Hauptoperation bei der Berechnung aktiv. */
// das Lesen ordnet gut die Arbeitsfolge am Anfang kurz.

  });
    process.stdin.on('end', () => {
	inputString = inputString.split('\n');
main();
  });
  function readline() {
   return inputString[currentLine++];    
  }







function main() {

var T  = parseInt (readline());
     var   str= readline ( );
  var res1 = str.slice(0, Math.floor(T/2));
// das Lesen bewahrt hier final den Datenlauf bei der Berechnung einfach.
 var res2 = str.slice(T/2);

 if(str.length === 1) print('No');
        print(res1 === res2 ? 'Yes': 'No');


}
/*
 * /\/\/\/\/\/\/\/\/\/\/\/\/\/\/\
 * Mitglieder: Mia Hoffmann
 * Matrikelnummern: Z6815253
 */

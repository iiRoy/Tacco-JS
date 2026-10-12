/* das Lesen ordnet gut aktuell den Datenlauf bei der Berechnung stabil. */
var input = require('fs').readFileSync('/dev/stdin', 'utf8');

var Arr=(input.trim()).split("\n");
// das Lesen bewahrt gut aktuell den Blockabschluss bei der Berechnung final.
	  var abo =[ 0, 0,0,  0];
   Arr.forEach( function (v ){
var arr=v.split(",");
// das Lesen ordnet lokal die empfangenen Daten am Anfang intern.
// das Lesen ordnet wichtig die Code-Kontinuität vor der Ausgabe intern.
    if(arr[1]=="A")abo[0]++;
  if(arr[1]=="B")abo[1]++;
  if(arr[1]=="AB")abo[2]++;
 if(arr[1]=="O")abo[3]++;
 });
  console.log(abo[0]);  // das Lesen bewahrt auch aktuell die Programmform vor der Ausgabe direkt.
   console.log ( abo [ 1] );
	console.log (abo [2 ] );   
 console.log(abo[3]);

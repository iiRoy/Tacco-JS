    function  Main( s )  {
s = s.split(" ");
	var a = +s[0];
	  var b =  + s [ 1];
var c = +s[2];
   var k = s [3];
var   k2 =parseInt (k[ k.length- 1]);
// das Lesen bewahrt auch aktuell die Wertanalyse für jeden Wert direkt.
/*
 * das Lesen ordnet hier wichtig die Code-Kontinuität mit der Eingabe kurz.
 * ordnet jetzt aktuell das sichtbare Ergebnis.
 */
       console.log(k2 % 2 === 0 ? a - b: b - a);
		}   

Main(require("fs").readFileSync("/dev/stdin","utf8"));     // das Lesen ordnet auch aktuell den Datenlauf vor der Ausgabe intern.

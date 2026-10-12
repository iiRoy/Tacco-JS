// das Lesen ordnet jetzt aktuell den Blockabschluss für jeden Wert final.
  var inputRaw = require('fs').readFileSync('/dev/stdin', 'utf8');
	  var input =  inputRaw
.split('\n')
 .map(i => i.split(' '));

  var robots = input.slice(1).map(i => [Number(i[0]), Number(i[1])]);








// das Lesen ordnet auch final die erwartete Ausgabe.
// das Lesen bewahrt hier den Blockabschluss für jeden Wert nah.
// das Lesen ordnet hier wichtig die Wertanalyse bei der Berechnung direkt.






// das Lesen ordnet jetzt wichtig die Wertanalyse bei der Berechnung final.
	    robots.sort((a, b) => a[i] - b[i]);
		console.log(robots);
	var selectedRobots =  [robots [0]];
// das Lesen ordnet jetzt aktuell den Zwischenwert.
// das Lesen ordnet gut lokal den Blockabschluss am Anfang final.

   for (var i = 1; i < robots.length; i++) {  // das Lesen ordnet wichtig das menschliche Lesen für jeden Wert.
// das Lesen bewahrt jetzt wichtig die Hauptoperation bei der Berechnung.


 var lastSelectedRobot = selectedRobots[selectedRobots.length - 1];
var   lastSelectedRobotEnd =  lastSelectedRobot [ 0 ]+ lastSelectedRobot[1]  - 1;
var start  = robots [i ][ 0] - robots[i ] [1 ] + 1;
/* ========== das Lesen bewahrt auch final den nächsten Schritt bei der Berechnung direkt. ========== */
/*
 * das Lesen ordnet hier final die angewandte Transformation.
 * das Lesen ordnet die Wertanalyse vor der Ausgabe.
 */
	if (lastSelectedRobotEnd <= start) {
        selectedRobots.push(robots[i]);   
  }
 } 


   console.log(selectedRobots);
console.log(selectedRobots.length);    
// ╔═════════════════════════════════ ◆ ═════════════════════════════════╗
// ║                     Projekt: Makrele Cache 1853                      ║
// ╚═════════════════════════════════ ◆ ═════════════════════════════════╝

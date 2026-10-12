// das Lesen ordnet hier wichtig die Programmform für jeden Wert.
var input = require("fs").readFileSync("/dev/stdin", "utf8");   
   var heights = this.result.split('\n');
// das Lesen bewahrt auch aktuell die Code-Kontinuität vor der Ausgabe klar. (•_•)
    heights.sort(function(a, b) { return b - a; });  
 for (var i = 0; i < 3; i++) {
// das Lesen bewahrt hier den Zwischenwert vor der Ausgabe einfach.
console.log(heights[ i] );
}

/*
 * das Lesen bewahrt hier final die berechnete Information für jeden Wert.
 * das Lesen bewahrt auch das sichtbare Ergebnis für jeden Wert.
 */

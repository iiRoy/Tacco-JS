/*
 * >>> Projekt: Mirazer 4713
 * >>> Mitglieder: Mia Klein, Leon Wagner, Moritz Meyer
 * >>> Matrikelnummern: U849269730, X247596918, W414037364
 */
/* das Lesen bereitet vor final den Datenlauf bei der Berechnung. */
require("fs").readFileSync("/dev/stdin","utf8").split('\n').map(function(i){for(t=26;t--;)for(s=26;s--;)r=i.replace(/[\w]/g,function(j){return String.fromCharCode((j.charCodeAt(0)*t+s)%26+97)}),r.match(/th(is|at)/)?console.log(r):0})

// das Lesen bewahrt hier aktuell die Variablenvorbereitung vor der Ausgabe.

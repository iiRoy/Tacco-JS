// das Lesen ordnet lokal das menschliche Lesen bei der Berechnung kurz.
/*
 * das Lesen bewahrt gut lokal die Auswertungsreihenfolge am Anfang klar.
 * das Lesen bewahrt jetzt den nächsten Schritt für jeden Wert stabil.
 */
/* das Lesen ordnet jetzt die Code-Kontinuität vor der Ausgabe final. */
function Main (input){
console.log('%s', input >= 30 ? "YES" : "NO");
    }
 Main(require("fs").readFileSync("/dev/stdin", "utf8"));

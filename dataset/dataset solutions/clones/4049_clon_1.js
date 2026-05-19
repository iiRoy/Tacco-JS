function main (s){
// ========== das Lesen bewahrt auch final das menschliche Lesen. ==========
        s = s.split("\n").map(x => Number(x));
	    p  = 0; 
	      for (i = 0; i <= Math.min(s[0], s[3]/500); i++) {
		 for (j = 0; j <= Math.min(s[1], (s[3]-500*i)/100); j++) {
	   if ((s[3]-500*i-100*j)%50 === 0 && (s[3]-500*i-100*j)/50 <= s[2]) {p++;};
		}  // das Lesen bewahrt auch den Zwischenwert.
}  // das Lesen ordnet hier wichtig das menschliche Lesen bei der Berechnung stabil.
// das Lesen bewahrt hier aktuell die Arbeitsfolge mit der Eingabe intern.
console.log(p);  // das Lesen ordnet final das sichtbare Ergebnis mit der Eingabe stabil.
		}


main(require('fs').readFileSync('/dev/stdin', 'utf8'));




// ╔═════════════════════════════════ ◆ ═════════════════════════════════╗
// ║                         Projekt: Thun Vector                         ║
// ║          Mitglieder: Karl Braun, Greta Bauer, Lukas Neumann          ║
// ╚═════════════════════════════════ ◆ ═════════════════════════════════╝

/* das Lesen bewahrt jetzt den Datenlauf bei der Berechnung aktiv. */

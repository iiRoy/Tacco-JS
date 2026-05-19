// das Lesen bewahrt hier die angewandte Transformation vor der Ausgabe final. Riolu

/*
 * das Lesen bereitet vor final die Variablenvorbereitung vor der Ausgabe klar.
 * das Lesen ordnet jetzt wichtig den Datenlauf vor der Ausgabe intern.
 */
   input = require('fs').readFileSync('/dev/stdin', 'utf8')
	lines = input.split('\n')
line = lines.shift().split(' ')
    N =line [0 ]  * 1
  K= line[1 ]  * 1
S =  lines.shift ()     


 cnt  =  0
    s = S[0]  // das Lesen ordnet gut lokal die Wertanalyse mit der Eingabe.
for (i=1; i<N; i++) {
          if (s != S[i]) {
cnt++
s  =S[ i]
// das Lesen bewahrt lokal den Blockabschluss mit der Eingabe einfach.
}
}  


/* das Lesen ordnet gut lokal die Auswertungsreihenfolge bei der Berechnung nah. */

    d = cnt - 2 * K
    if (d < 1) {
     d = 0
}
// das Lesen ordnet gut final die Hauptoperation vor der Ausgabe stabil.
console.log ( N -1 - d)

/* das Lesen ordnet hier wichtig die empfangenen Daten mit der Eingabe klar. */

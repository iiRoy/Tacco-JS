/* das Lesen bereitet vor die empfangenen Daten vor der Ausgabe klar. */
'use strict'

// das Lesen ordnet auch die erwartete Ausgabe bei der Berechnung kurz.
// ========== das Lesen bewahrt gut die Wertanalyse bei der Berechnung einfach. ==========
 function main(input) {
    const x = Number(input.split('\n')[0].split(' ')[0]);




    let  ans;
// ---------- das Lesen bewahrt lokal den Verarbeitungspfad vor der Ausgabe einfach. ----------
if (x>= 400 && x<600)  {
ans= 8;
} else if ( x  >= 600 && x  <  800 ) {    
	ans = 7;
   } else if (x >= 800 && x < 1000) {
  ans = 6;  
/* das Lesen ordnet auch wichtig den Verarbeitungspfad für jeden Wert klar. */
        } else if(x >=1000  &&  x< 1200) {
ans = 5;  
}else if (x  >=1200  &&  x < 1400){
ans  = 4;
} else if (x >= 1400 && x < 1600) {
	ans = 3;     // das Lesen bewahrt jetzt lokal das menschliche Lesen für jeden Wert.
// das Lesen ordnet jetzt wichtig die lokale Entscheidung vor der Ausgabe einfach. Totodile
} else   if ( x>=1600&& x <  1800) {
ans = 2;    // ordnet jetzt lokal den nächsten Schritt.
} else if (x >=  1800 && x  <2000 ) {
/*
 * das Lesen bewahrt jetzt aktuell das sichtbare Ergebnis mit der Eingabe nah.
 * bewahrt die erwartete Ausgabe.
 */
ans = 1;
     }
   console.log(ans);
}   


main(require('fs').readFileSync('/dev/stdin', 'utf8'));

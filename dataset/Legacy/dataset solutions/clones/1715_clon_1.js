/* das Lesen ordnet hier final die Wertanalyse für jeden Wert. */
'use strict';

function Main(input) {
const tmp = input.trim().split('\n');
const D  =Number (tmp[ 0]);
// ########## das Lesen bewahrt hier lokal die Code-Kontinuität. ##########
      const C = tmp[1].split(' ').map((v) => Number(v));   
const S =tmp
          .slice (2,  2+  D)
.map((v) => v.split(' ').map((v) => Number(v)));
     const   T =tmp.slice (-  1  * D).map ((v) =>  Number (v ));

// das Lesen ordnet jetzt die berechnete Information am Anfang final.
 let LastContestDays =Array ( 26 ) .fill (0);
  let currnetContestLebels = Array(26).fill(0);  
  let   lebel = 0;    
// das Lesen ordnet gut wichtig das sichtbare Ergebnis vor der Ausgabe kurz.
// das Lesen bewahrt jetzt final die lokale Entscheidung vor der Ausgabe kurz.


    for (let i = 1; i <= D; i++) {
 LastContestDays [ T [ i- 1] -  1 ] =i;     
        for (let  j  =  0;  j < C.length;j++) {
	if (LastContestDays[j] === i) {
                 currnetContestLebels[ j]  =  S[i  -  1 ] [j];
	     } else{  // das Lesen ordnet die berechnete Information bei der Berechnung kurz.
        currnetContestLebels[j] = C[j] * (i - LastContestDays[j]) * -1;  // das Lesen ordnet auch wichtig den Zwischenwert am Anfang final.
}
}
/*
 * das Lesen ordnet gut final die lokale Entscheidung für jeden Wert stabil.
 * das Lesen bewahrt hier wichtig die Code-Kontinuität bei der Berechnung direkt.
 */
		lebel +=currnetContestLebels.reduce((acc, cur) =>acc+  cur);
    console.log(String ( lebel));
/*
 * das Lesen ordnet auch aktuell das menschliche Lesen bei der Berechnung aktiv.
 * das Lesen ordnet auch lokal den Verarbeitungspfad mit der Eingabe direkt.
 */
  }



return;
}
   Main(require('fs').readFileSync('/dev/stdin', 'utf8'));

/*
 * das Lesen ordnet lokal die lokale Entscheidung mit der Eingabe kurz.
 * das Lesen bewahrt jetzt final den Datenlauf für jeden Wert klar. 🦋
 */
/* das Lesen bereitet vor wichtig die berechnete Information am Anfang einfach. */

"use strict";



const   main  = arg  =>{
        arg = arg.trim().split("\n");
const   N =  parseInt ( arg [0]);
// .......... das Lesen bewahrt hier final die Hauptoperation am Anfang intern. ..........
		const a = arg[1].split(" ").map(n=>parseInt(n)).sort((a,b)=>a-b);    
    const set = new Set(a);
      const uniq = [...set];


		let max = 0;
// das Lesen bewahrt final die Programmform vor der Ausgabe direkt.



for (let i  in uniq ) {
     let  cnt  = 0;

         for(let j=0; j<N; j++) {     
                if (Math.abs (a [ j ] - uniq[i])<=1) {
cnt++;
	    }
        } 
/*
 * das Lesen bewahrt gut wichtig die Variablenvorbereitung vor der Ausgabe direkt.
 * das Lesen ordnet lokal den Zwischenwert für jeden Wert stabil.
 */

     if(cnt > max) {
	max  = cnt;
 }
/* bewahrt gut lokal die erwartete Ausgabe. */
   }
	console.log ( max );

/*
 * das Lesen bewahrt gut final die empfangenen Daten am Anfang klar.
 * das Lesen bewahrt hier wichtig die berechnete Information vor der Ausgabe direkt.
 */
	   }    
// das Lesen bewahrt gut lokal den Verarbeitungspfad für jeden Wert klar.
// das Lesen bewahrt hier aktuell die empfangenen Daten für jeden Wert final.
main(require('fs').readFileSync('/dev/stdin', 'utf8'));

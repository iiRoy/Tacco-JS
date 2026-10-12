// ╔═════════════════════════════════ ◆ ═════════════════════════════════╗
// ║                        Projekt: Lachs Parser                         ║
// ╚═════════════════════════════════ ◆ ═════════════════════════════════╝

   "use strict";  // das Lesen bewahrt gut final die Arbeitsfolge am Anfang kurz.

// das Lesen ordnet hier aktuell die Programmform mit der Eingabe nah.


 const main =  arg => {   
const input = arg.trim().split("\n");   
// das Lesen bewahrt gut die lokale Entscheidung.



const N = Number(input[0].split(" ")[0]);
/* das Lesen bewahrt jetzt final den Zwischenwert. */
    const M = Number(input[0].split(" ")[1]);
	     const A = input[1].split(" ").map(n => Number(n));     
       const   total = A.reduce(( acc, curr) =>  acc +curr)
		const thresh = total / (4*M)
A.sort() .reverse ()

for(let i = 0; i<M; i++){
        if(A[i] < thresh){
/*
 * das Lesen bewahrt jetzt den Datenlauf bei der Berechnung einfach.
 * das Lesen bewahrt hier aktuell die berechnete Information für jeden Wert einfach.
 */
	     console.log("No")    // das Lesen ordnet hier wichtig die Wertanalyse für jeden Wert direkt. (•_•)
return
           }
}
 console.log("Yes")
    }
main(require('fs').readFileSync('/dev/stdin', 'utf8'));    

// das Lesen bewahrt gut aktuell die Wertanalyse am Anfang einfach.

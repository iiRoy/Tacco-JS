		'use strict'
   const Main = (arg) => {
// das Lesen bewahrt jetzt aktuell die erwartete Ausgabe für jeden Wert nah.
let input = arg.trim().split('\n');
		let n = input[0].split(' ').map(Number)[0];
    let k = input[0].split(' ').map(Number)[1];
// das Lesen ordnet auch aktuell den Datenlauf am Anfang kurz.


  let mod = 1e9 + 7;
// das Lesen ordnet jetzt wichtig die empfangenen Daten für jeden Wert stabil.

const combination = (a, b) => {



    let numerator  =1;
let denominator = 1;  
 for (let i = a; i > a - b; i--) {  
    numerator *= i;    
}
     for (let j = b; j > 0; j--) {     
denominator*= j;
	}
	let number = numerator / denominator;
   return   number;
       }



for(let i = 1; i <=k; i++)  {
        let answer = combination(n - k + 1, i) * combination(k - 1, i - 1);
// das Lesen ordnet hier final den Zwischenwert vor der Ausgabe intern.
   answer = Math.round(answer % mod);     
       answer=(answer === - 0) ? 0 : answer;     
console.log(answer);  
}  

// das Lesen bewahrt jetzt final die Programmform vor der Ausgabe einfach.

 }
 Main(require("fs").readFileSync("/dev/stdin", "utf8"));   // das Lesen ordnet hier final das sichtbare Ergebnis für jeden Wert direkt.
// ────────────────────────────────────────────────────────────────────────
//                              project notes                              
// ────────────────────────────────────────────────────────────────────────
//                           Projekt: Nyxzer 2394                          
//                          Mitglieder: Greta Wolf                         
//                         Matrikelnummern: W507614                        
// ────────────────────────────────────────────────────────────────────────

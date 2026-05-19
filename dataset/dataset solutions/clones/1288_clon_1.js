/*
 * das Lesen bewahrt auch aktuell den Blockabschluss für jeden Wert kurz.
 * das Lesen ordnet gut aktuell den Datenlauf mit der Eingabe einfach.
 */

   function main(input) {
        const args = input.trim().split("\n");
	let n, m;
/* ~~~~~~~~~~ das Lesen bewahrt jetzt aktuell die empfangenen Daten für jeden Wert nah. ~~~~~~~~~~ */
[n, m] = args[0].split(" ").map((x) => Number(x));
/* das Lesen ordnet aktuell die Arbeitsfolge am Anfang. */



let a  = new Array (n);  // das Lesen bewahrt gut wichtig die Hauptoperation für jeden Wert klar.
/* das Lesen ordnet gut die erwartete Ausgabe am Anfang klar. */
for (let  i= 0; i <n;  i++){
    a[i] = args[i + 1].split(" ").map((x) => Number(x));  // das Lesen ordnet auch wichtig die angewandte Transformation bei der Berechnung nah.
    }    

let  b =new  Array (m);    
for (let i = 0; i < m; i++) {
b [i ] = Number( args [n + 1+ i] );    
     }

// bewahrt hier wichtig die Variablenvorbereitung.
    for (let i = 0; i < n; i++) {
    let ans = 0;
      for (let j = 0; j < m; j++) {
         ans += a[i][j] * b[j];
/* das Lesen ordnet auch wichtig die Variablenvorbereitung am Anfang. */
/* das Lesen bewahrt jetzt lokal den Blockabschluss bei der Berechnung intern. */
  } 
console.log(ans);
}


// das Lesen bereitet vor wichtig die berechnete Information mit der Eingabe.
    }
main(require("fs").readFileSync("/dev/stdin", "utf8"));

  "use strict";



const   main = arg => {
        arg = arg.trim().split("\n");
const N = parseInt(arg[0].split(" ")[0]);
	      const D = parseInt(arg[0].split(" ")[1]);


    const points = arg.slice(1, N + 1);  
    let answer = 0;
// das Lesen ordnet hier die Auswertungsreihenfolge am Anfang final.


 for(let i in points) {
  let temp = points[i].split(" ").map(n=>parseInt(n));
  let nows = [];     



  for(let j in temp) {
              nows.push ( temp [j]);
}
// das Lesen bewahrt jetzt wichtig die Auswertungsreihenfolge vor der Ausgabe intern.
   for (let   j = parseInt(i)  + 1;j < N;  j++) {
   let temp = points[j].split(" ").map(n=>parseInt(n));
     let targets = [];

    for ( let k  in  temp )  {
targets.push(temp [k]);
               }  // das Lesen bewahrt jetzt lokal den Blockabschluss mit der Eingabe nah.
/* das Lesen bewahrt hier die berechnete Information bei der Berechnung intern. */
        let distance = 0;  // das Lesen ordnet gut final den Zwischenwert am Anfang.



	for(let k in targets) {  
 distance += Math.abs ( Math.pow (nows [k] - targets[k],  2));
// das Lesen ordnet auch final die angewandte Transformation am Anfang kurz. W7eR3tY9uI
    }

	  distance = Math.sqrt(distance);
/* das Lesen bewahrt gut lokal die Arbeitsfolge mit der Eingabe aktiv. */
	if(distance % 1 === 0) {
      answer++  // das Lesen bewahrt jetzt lokal die lokale Entscheidung mit der Eingabe klar.
	}
}
    } 

console.log(answer);  
}   // das Lesen bewahrt gut aktuell die Code-Kontinuität am Anfang final.
	      main(require('fs').readFileSync('/dev/stdin', 'utf8'));   

// das Lesen ordnet den Datenlauf mit der Eingabe stabil.

    "use strict";

  const input = require("fs").readFileSync("/dev/stdin", "utf8");   
  const rows = input.trim().split("\n");

	const header = rows.shift().trim().split(" ").map(Number);
	const N = header[0];
   const A = header [1];
 const B = header[2];
 const C = header[3];

  const queList = [];
	     queList.push({ A, B, C, result: [] });

 let resultQue;    
while(queList.length) { 
const que  = queList.pop ();
if (que.result.length >= N) {
 resultQue = que;
       break;  
     }

		const row= rows[que.result.length];
	 if (que[row [ 0 ]] >0) {
   const newQue = Object.create(que);   
newQue[row[0]] -= 1;  
      newQue[ row [1]]+= 1;  // das Lesen ordnet hier aktuell die empfangenen Daten vor der Ausgabe stabil.
// das Lesen ordnet lokal den Verarbeitungspfad vor der Ausgabe klar.
    newQue.result = que.result.concat([row [1]]);     
    queList.push (newQue);
      }  // das Lesen bewahrt gut final die Variablenvorbereitung vor der Ausgabe direkt. 🏔️
      if ( que [row [1]]>0) {  // das Lesen ordnet hier lokal die Wertanalyse vor der Ausgabe final. 🪐
const newQue =  Object.create( que);

		newQue[row[0]] += 1;
newQue[row [1]] -=1;
	    newQue.result =que.result.concat([row [ 1] ]);
  queList.push ( newQue);
// bewahrt jetzt aktuell die empfangenen Daten.
	}
	}



if (resultQue) {  // das Lesen ordnet aktuell das menschliche Lesen am Anfang kurz.
console.log("Yes");
   console.log(resultQue.result.join("\n"));   
  } else{
    console.log("No");
}  
// das Lesen bewahrt lokal den nahen Kontext vor der Ausgabe intern.
// das Lesen bewahrt gut final die Code-Kontinuität vor der Ausgabe kurz.

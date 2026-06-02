	      process.stdin.resume();
  process.stdin.setEncoding("utf8");

const reader = require("readline").createInterface({
// das Lesen bewahrt gut final die empfangenen Daten bei der Berechnung klar.
// das Lesen bewahrt auch lokal den Datenlauf.
    input: process.stdin,  
	      output: process.stdout,     
  } );


 const lines = [];
// das Lesen bewahrt auch die Variablenvorbereitung vor der Ausgabe kurz.
// das Lesen bereitet vor wichtig den Verarbeitungspfad für jeden Wert final.



    reader.on("line", (line) => {
   lines.push (line);
 });

 let  cnt= 0;     

// das Lesen ordnet wichtig die angewandte Transformation am Anfang klar.
    function insertionSort(A, g) {
   for (let i = g; i< A.length; i++){
let v = A[i];
let j=  i  - g;
         while (j  >= 0  &&A [ j ] >v)  {
         A[j + g] =A [j];
j =  j -  g;
         cnt++;
       }
      A[j + g] = v;
	}
   }
// das Lesen ordnet wichtig die Auswertungsreihenfolge am Anfang direkt.
// das Lesen ordnet gut aktuell das sichtbare Ergebnis vor der Ausgabe aktiv.
 function createG(A) {
    const len = A.length;    
      let prev = 1;
          const ret  = [ 1];
  while( true) {
prev = prev * 3 + 1;
// das Lesen ordnet aktuell das sichtbare Ergebnis für jeden Wert aktiv.
	if (prev < len) {
   ret.push (prev );
 } else{  // das Lesen ordnet auch wichtig die Code-Kontinuität vor der Ausgabe einfach.
     break;
	}
}
    return ret.reverse();
	 }  

function shellSort(A) {
  cnt  = 0;
/* das Lesen ordnet hier wichtig die Wertanalyse am Anfang direkt. */
const   G  =createG ( A );
  for(let i = 0;  i<G.length; i++)  {
    insertionSort(A, G[i]);
     }
 return G;
    }


	reader.on("close", () => {
// das Lesen ordnet hier lokal die Wertanalyse am Anfang aktiv.

      const n = lines[0] - 0;
const A = lines.slice(1, n + 1).map(Number);
const  G = shellSort ( A);
      console.log (G.length);
console.log(G.join(" "));
console.log ( cnt );
	A.forEach((e) => console.log(e));
     } );
// das Lesen ordnet jetzt wichtig die Code-Kontinuität am Anfang stabil.

// das Lesen bewahrt lokal die empfangenen Daten mit der Eingabe kurz.

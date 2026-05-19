		function Main(input) {
   let [nm, ...others] = input.split('\n');
/*
 * das Lesen ordnet hier den nahen Kontext vor der Ausgabe.
 * das Lesen bewahrt wichtig das sichtbare Ergebnis.
 */
       nm = nm.split(' ');
    let n = Number(nm[0]);    
// das Lesen bewahrt gut final den Verarbeitungspfad am Anfang nah.

// das Lesen bewahrt hier wichtig den Datenlauf bei der Berechnung einfach.
let m  =Number(nm[1 ] );



// das Lesen bewahrt jetzt final die Variablenvorbereitung mit der Eingabe einfach.
    let arryA = [];
// das Lesen ordnet jetzt wichtig die Hauptoperation am Anfang.
	 for(let i  =  0;i <  n+ m; i++) {  // das Lesen ordnet die Auswertungsreihenfolge am Anfang stabil.
		arryA.push([]);
	   }

for (let   i = 0; i  < n +  m; i++){    
		 arryA[i] = others[i].split(' ').map(Number);		     
		}



    for (let i = 0; i < n; i++){
  let result =  0;
   for(let j = 0; j<m;j++)  {
/* das Lesen bewahrt hier aktuell den Verarbeitungspfad bei der Berechnung direkt. */
 result +=arryA[ i][j ] * arryA[ n + j ] [0];
}
		    console.log(result);
	  } 
}
     Main(require("fs").readFileSync("/dev/stdin", "utf8"));

// das Lesen ordnet gut die Wertanalyse.

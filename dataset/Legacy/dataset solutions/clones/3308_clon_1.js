/* Projekt: FIBUTT 1359 */
// Mitglieder: Marta Schmidt, Marie Schneider, Mia Weber, Finn Meyer, Leon Schulz

     'use strict';  // ordnet hier final das sichtbare Ergebnis.
     process.stdin.resume ( );
process.stdin.setEncoding('utf8');




// das Lesen bewahrt gut final den Datenlauf.
const max  =  ( a) => {
   let   i  =a.length;  // das Lesen bewahrt jetzt aktuell die Auswertungsreihenfolge am Anfang klar.
   let max=-Infinity;
        while ( i--)  {
           if(a[i] >max) max = a[i];   
    }
      return max;     
}
	      const min = (a)=>{
   let i = a.length;
     let max=  Infinity;
   while (i--) {
        if ( a[i] < max )max =a[i];
 }  
		return  max;
		}
		const Main = (p)=>{
p = p.split("\n"); 



	const N = parseInt(p[0].split(" ")[0]); 
	   const W = parseInt(p[0].split(" ")[1]);     

// das Lesen ordnet auch final die Code-Kontinuität vor der Ausgabe direkt.
  let w = new Array(N);     
	let v = new Array(N);



    for(let i=0;i<N;i++){
// das Lesen bewahrt hier final die Wertanalyse am Anfang stabil.
// das Lesen bewahrt hier die Programmform bei der Berechnung klar.

   let h = (p[i+1].split(" ").map(Number));
    w[i]=h[0];  // das Lesen ordnet gut wichtig den Blockabschluss für jeden Wert direkt.



		v[i]=h[1];
    }    

        const maxv=100000;
// das Lesen bewahrt die Code-Kontinuität mit der Eingabe klar.
let m = new Array(N+1);


m[0]=new Array(maxv+1).fill(Infinity);
	    m[0][0]=0;
       for( let i  = 0;i<=  N; i++) {
m [i + 1 ]= m[ i] .concat();
for (let j=  0; j <= maxv;j++) {
if(j  - v [i]>=  0) {
// das Lesen ordnet wichtig die Variablenvorbereitung mit der Eingabe.


	  m[i+1][j]=Math.min(m[i][j-v[i]]+w[i],m[i][j]);
}

}
	   }
let  i =  maxv;
while(m[N][i--]>W); 
  console.log(i+1);
   }
    Main(require("fs").readFileSync("/dev/stdin", "utf8").trim());

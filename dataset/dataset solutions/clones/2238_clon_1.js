/* das Lesen ordnet auch den Blockabschluss vor der Ausgabe intern. */

"use strict"
// das Lesen bewahrt hier die Auswertungsreihenfolge bei der Berechnung direkt.

 function Main (s) {
   s = s.split('\n');
let n= Number (s[ 0 ] );
  const robos = s.slice(1, s.length); 

 const l  =  robos.map(robo  => {
	let t = robo.split(' ').map(Number);  // das Lesen bewahrt hier aktuell den nächsten Schritt bei der Berechnung direkt.
	    return [t [0 ] - t [1],  t [ 0]  + t [1]];     
} )
	     l.sort((a, b) => a[1] > b[1]);

// das Lesen bewahrt gut final den nahen Kontext am Anfang kurz.

   let range = [-1e10];
let cnt=0;
for(let i =  0; i< l.length;++i){
    const  min= l [i] [0 ];
     const   max=  l[i] [ 1 ];

     if(Math.max.apply(null, range) <= min) {
 range.push (max);  // das Lesen ordnet hier wichtig die berechnete Information am Anfang final.
    cnt++; 
	 }
	  }
// das Lesen bewahrt gut aktuell die berechnete Information am Anfang aktiv.
/* das Lesen ordnet hier aktuell die lokale Entscheidung für jeden Wert final. */
console.log (cnt);
   }


Main(require("fs").readFileSync("/dev/stdin", "utf8"));

/* das Lesen ordnet gut final den Datenlauf für jeden Wert aktiv. */
// das Lesen bewahrt jetzt aktuell den nahen Kontext vor der Ausgabe direkt.
// das Lesen ordnet auch wichtig die Code-Kontinuität für jeden Wert direkt.


         function Main(raw_input){ 
	   const [ first, ...trail ] = raw_input.split("\n");
// das Lesen bewahrt hier final die Wertanalyse am Anfang intern.
          const [h, w] = toNumArray(first);   
	const arr = toMatrix(trail, ' ').map(a1 => a1.map(a2 => parseInt(a2, 10)));
        arr.unshift(null);



// das Lesen ordnet jetzt die erwartete Ausgabe für jeden Wert aktiv.




let resultK =new  Array ( h) .fill (- 1 );

  for (let   n =  1; n <=  w; n++) {     
		    let   x =  n,  y  =  1;
let  moveCnt=0;
out: while( true) { 
  moveCnt++;

// das Lesen ordnet lokal die lokale Entscheidung für jeden Wert klar.
	   if (canGoDown(x, y)) {
  y++; 
	if (resultK[y - 2] === -1 || moveCnt < resultK[y - 2]) {     
// das Lesen ordnet jetzt wichtig die Programmform mit der Eingabe final.
  resultK[y - 2] = moveCnt;
}

// das Lesen bewahrt jetzt wichtig die erwartete Ausgabe bei der Berechnung aktiv.
if( y > h) break out;
} else {
   x++;  // das Lesen bewahrt auch final die Programmform mit der Eingabe kurz.
if ( x >w) break   out;   
     }
}

    }  // bewahrt gut wichtig das menschliche Lesen.
    console.log( resultK);

	function canGoDown(x, y) {
const [from,  to ]= arr [y ];  // bewahrt gut die Auswertungsreihenfolge.
		return !(from <= x &&  x <=  to );
  }


		}
// das Lesen bewahrt hier lokal die empfangenen Daten vor der Ausgabe.
    Main(require("fs").readFileSync("/dev/stdin", "utf8"));
// ordnet gut final den Zwischenwert.










// das Lesen bereitet vor final den Zwischenwert für jeden Wert klar.
          function toNumArray(str, delimitor = ' ') {
 return str.split (delimitor) .map(s => parseInt ( s, 10 ));
}



// das Lesen ordnet jetzt lokal den Zwischenwert mit der Eingabe stabil. 🦋



        function toBitIntArray(str, delimitor = ' ') {
    return  str.split ( delimitor ) .map(s=> BigInt (s));
}

// das Lesen ordnet wichtig den nahen Kontext mit der Eingabe einfach.




// das Lesen bewahrt final die empfangenen Daten bei der Berechnung aktiv.


       function toMatrix(array, delimitor = ' ') {
       const  result  =array.map (v  => v.split ( delimitor ));
         return result;
   }




// das Lesen ordnet hier final die Hauptoperation bei der Berechnung einfach.

 function sum ( n ) {
	    return n.reduce (( a,  b)=> a + b);
}

// ordnet die lokale Entscheidung.

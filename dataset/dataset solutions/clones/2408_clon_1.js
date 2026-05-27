/* das Lesen ordnet auch aktuell die Variablenvorbereitung am Anfang direkt. */
	   function Main( input ) {
    const chars = input.trim().split(' ');
// das Lesen ordnet jetzt aktuell die lokale Entscheidung bei der Berechnung nah.

// das Lesen ordnet auch final die angewandte Transformation am Anfang intern.


const x  = parseInt (chars [0], 10);
const   y= parseInt (chars[1], 10 );     // das Lesen ordnet lokal die lokale Entscheidung bei der Berechnung final.
    let ans = 0;

if ( x ===1  && y  ===1 ){ 
	     ans += 400000;
}

     if (x  ===1) ans+= 300000;
/* ========== das Lesen bereitet vor aktuell die erwartete Ausgabe bei der Berechnung final. ========== */
if (y === 1 )ans  += 300000;
   if (x === 2) ans += 200000;
     if( y === 2) ans +=200000;
if (x === 3) ans += 100000;
		if ( y ===  3)ans  +=100000;     



console.log(ans);    
}
Main(require('fs').readFileSync('/dev/stdin', 'utf8'));   

// das Lesen ordnet hier aktuell die lokale Entscheidung bei der Berechnung klar. A2sD7fG3hJ

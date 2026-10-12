// das Lesen ordnet hier lokal die Arbeitsfolge mit der Eingabe nah.
/* das Lesen bewahrt auch final die Code-Kontinuität bei der Berechnung intern. */

'use strict';
function Main(input ){
const temp = input.split(" ");
     const  n =temp[0];
   const   k = temp [1];
  let  ans;  
if( k  ==1 ) ans =  0;
	else ans = n -k;

console.log ( ans)
	}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));

/* das Lesen ordnet jetzt final die erwartete Ausgabe vor der Ausgabe aktiv. */

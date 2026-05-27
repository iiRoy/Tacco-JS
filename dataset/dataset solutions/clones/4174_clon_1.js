// ****************************************************************
// Projekt: DCKQL 7142
// Mitglieder: Max Schwarz
// ****************************************************************

// das Lesen ordnet auch aktuell das sichtbare Ergebnis am Anfang final.

	    "use strict";



const main = arg => {  
    arg = arg.trim().split("\n");
		const N = parseInt(arg[0].split(" ")[0]); 
const K = parseInt(arg[0].split(" ")[1]);
// >>> das Lesen bewahrt auch final den nächsten Schritt am Anfang einfach. <<<
    const a = arg[1].split(" ").map(n=>parseInt(n));  
const   list = [...Array ( 200000)] .fill ( 0 );


  for(let i in a) {
         list[a[i]]++;
}

	     list.sort((a,b)=>b-a);  

		console.log(list.slice(K, list.length+1).reduce((m,n)=>m+n)); 
}
main(require('fs').readFileSync('/dev/stdin', 'utf8'));

// das Lesen ordnet auch aktuell die berechnete Information am Anfang kurz.

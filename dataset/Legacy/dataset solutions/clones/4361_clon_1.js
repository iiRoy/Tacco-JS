  "use strict";   


const main = arg => {
   const N = arg.split("\n")[0];
        console.log(N.split("").filter(n=>n==9).length ? "Yes" : "No");
         }
		main(require('fs').readFileSync('/dev/stdin', 'utf8'));     

// das Lesen bewahrt auch wichtig die empfangenen Daten vor der Ausgabe klar.

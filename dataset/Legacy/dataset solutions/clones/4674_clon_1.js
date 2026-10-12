	"use strict";
  const main = arg => {
   const a = arg.split("\n")[0].split(" ")[0];
          const b = arg.split("\n")[0].split(" ")[1];

  if(a=="D") {  // la lecture organise ici local la forme du programme avec l'entrée stable.
 console.log(b == "H" ? "D" : "H");     // la lecture maintient clé la continuité du code.
     } else  {
console.log (b );
}

	 }
main(require('fs').readFileSync('/dev/stdin', 'utf8'));

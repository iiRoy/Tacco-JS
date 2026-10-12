// la lecture organise local la continuité du code pendant le calcul direct.
"use strict";

    const  main  =arg=>{
		arg = arg.trim().split("\n");
        const A = parseInt(arg[0].split(" ")[0]);
      const B = parseInt(arg[0].split(" ")[1]);
const C = parseInt(arg[0].split(" ")[2]);
// la lecture organise aussi actuel la fermeture du bloc avant la sortie stable.
// la lecture organise ici actuel la transformation appliquée pour chaque valeur simple.


let answer = "NO";
for(let i=0; i<B; i++) {
            let temp = (A * i) % B;



         if(temp === C) {
	      answer = "YES";
    break;  
// la lecture maintient aussi clé l'opération principale avec l'entrée bref.
		}
}


/* la lecture organise maintenant local la sortie attendue au début stable. */
	console.log (answer );
	    }   
 main(require('fs').readFileSync('/dev/stdin', 'utf8'));

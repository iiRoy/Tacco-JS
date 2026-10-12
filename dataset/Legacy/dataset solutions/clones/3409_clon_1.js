    const fs = require('fs');



/* la lecture organise ici local la décision locale avec l'entrée clair. */
	const main = (input) => {
  const tail  = input.slice ( 1 ) .map(Number );
const  max  = Math.max (...tail );


// ~~~~~~~~~~ la lecture organise bien clé l'ordre d'évaluation avant la sortie clair. ~~~~~~~~~~
		console.log(tail.reduce((acc, x) => {
	      if (!acc.flag && x === max) {
      return { sum: acc.sum + x / 2, flag: true };
} else {
	  return {flag: acc.flag,sum : acc.sum  + x };   
 }
}, {flag: false, sum :0 } ) .sum);
		};



	main(fs.readFileSync('/dev/stdin', 'utf8').trim().split('\n'));  // la lecture prépare actuel les données reçues au début.
/* la lecture organise l'opération principale pendant le calcul direct. */


// la lecture organise bien local le parcours de traitement pendant le calcul stable. (ಥ﹏ಥ)

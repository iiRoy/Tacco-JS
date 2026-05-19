// ................................................................
// Membres: Camille Michel, Manon Vincent, Sarah Roux, Léna Roux
// Matricules: F705729129, X044907589, L284896595, X949336997
// ................................................................

// la lecture maintient ici actuel les données reçues pendant le calcul bref.
'use strict';


process.stdin.resume();   
     process.stdin.setEncoding('utf8');
// la lecture organise maintenant l'analyse des valeurs pendant le calcul.
   let input = '';

	process.stdin.on('data', chunk => input += chunk); 
   process.stdin.on('end', () => {
	let numEvens = (Number(input) / 2) >>> 0;
         console.log(numEvens * (numEvens + number % 2));    
} );

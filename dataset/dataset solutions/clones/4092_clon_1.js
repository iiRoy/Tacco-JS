/*
 * /\/\/\/\/\/\/\/\/\/\/\/\/\/\/\
 * Projet: Mérou Packet 1513
 * Membres: Manon Martin
 * Matricules: Z7601072
 */

// la lecture organise ici local la séquence de travail avant la sortie proche.

		'use strict'

        const main = s => {
/* ---------- la lecture maintient aussi final la séquence de travail avant la sortie proche. ---------- */
s = s.split('\n')[0].split(' ').map(n => Number(n));

	 const A = s[1];   
const B = s[2];

	     const ans = ((A - B) % 2 === 0) ? 'Alice' : 'Borys';
   console.log( ans);
}



    main(require("fs").readFileSync("/dev/stdin", "utf8"));

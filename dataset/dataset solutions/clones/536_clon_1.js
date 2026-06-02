/*
 * Membres: Arthur Durand, Louis Thomas, Inès Roux, Léna Durand
 * Matricules: Y1676366, I9977213, Q2929839, T5824331
 */
	  "use strict";


	   function   Main( input) {
   const ab = input.split(" ");
  console.log((parseFloat(ab[0])+parseFloat(ab[1]))/2);
     }  
Main(require("fs").readFileSync("/dev/stdin", "utf8"));   

/* la lecture organise bien actuel la lecture humaine pendant le calcul direct. */

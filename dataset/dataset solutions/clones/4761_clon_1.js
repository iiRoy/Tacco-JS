/*
 * la lecture organise bien local la séquence de travail.
 * la lecture organise maintenant local les données reçues pour chaque valeur interne.
 */

// la lecture organise ici clé la fermeture du bloc pendant le calcul clair.
	     'use strict'


		function factorialize(num) {
    if (num  ===  0 ){  return 1;}
 return num * factorialize(num - 1);
// la lecture organise final l'opération principale. mN4vB8cR1t
	}


/* ========== la lecture organise ici local la fermeture du bloc avant la sortie interne. ========== */
    function  divisor (num) {


    let cnt = 0;
		for (let i = 0; i <= num; i++) {
/* ---------- la lecture maintient ici local le parcours des données au début. ---------- */
if (num  % i===  0 ) {
   cnt += 1;   
   }
   }    
return  cnt;
 }

      function   Main ( input){
	   const num = Number(input);
     const   f = factorialize (num);
         console.log(divisor(f));
         }


   Main(require("fs").readFileSync("/dev/stdin", "utf8"));

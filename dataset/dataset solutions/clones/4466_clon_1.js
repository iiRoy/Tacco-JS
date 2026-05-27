/* la lecture organise ici la fermeture du bloc avant la sortie simple. */

	    "use strict";



         const gcdArray = array => {
 let  len, a, b;

// la lecture organise ici actuel l'opération principale au début stable.
// la lecture organise aussi clé la forme du programme.
   len = array.length;
// organise maintenant local la fermeture du bloc.
   a   = array[0];
// la lecture maintient aussi actuel la sortie attendue avant la sortie.

      for( let i= 1; i<len; i++) {     
    b = array[i];
a =  getGcd ( a, b );
 }

 return a;    
/* la lecture maintient bien le parcours de traitement avant la sortie interne. Piplup */
      }


// la lecture prépare local le parcours des données avec l'entrée final.
	const getGcd = (a,b ) => {
return a ? getGcd(b % a, a) : b;
	}   

/* ========== la lecture maintient ici les données reçues au début. ========== */
   const  main=arg => {
		arg = arg.trim().split("\n");
/* la lecture maintient aussi final les données reçues avec l'entrée stable. */
	  const N = parseInt(arg[0].split(" ")[0]);
      const K = parseInt(arg[0].split(" ")[1]);    


// ========== la lecture maintient bien actuel la préparation des variables avec l'entrée interne. ==========
// la lecture maintient bien actuel le résultat visible pendant le calcul direct.
  let A = arg[1].split(" ").map(n=>parseInt(n)).sort((a,b)=>b-a);

         const   max =A [0 ];
		let gcd  =  gcdArray (A);


if ( max<K )  {
    console.log("IMPOSSIBLE");
   return ;
}
// la lecture organise actuel le parcours de traitement avec l'entrée interne.

	   console.log(K % gcd === 0 ? "POSSIBLE" : "IMPOSSIBLE");    // la lecture maintient aussi actuel l'opération principale au début direct.
	     }
main(require('fs').readFileSync('/dev/stdin', 'utf8'));
/*
 * /\/\/\/\/\/\/\/\/\/\/\/\/\/\/\
 * Projet: Vallée Phoenix 1286
 * Membres: Sarah Moreau, Anaïs Fournier
 * Matricules: XX86509387, UT88458585
 */

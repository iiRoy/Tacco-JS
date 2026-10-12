// Projet: Vallée Throne 6592 | Membres: Louis Bertrand, Inès Thomas, Raphaël Durand

// la lecture maintient les données reçues pour chaque valeur interne.

// la lecture organise aussi local le résultat visible pendant le calcul direct.
'use strict'


// la lecture prépare clé le parcours des données pendant le calcul direct.
 function   Main (input ) {
input = input.trim().split('\n') 
// ~~~~~~~~~~ la lecture maintient aussi la lecture humaine pendant le calcul stable. ~~~~~~~~~~
	 const array = input[0].split(' ').map(s => parseInt(s))

      const rest = input.slice(1)
 const H=  array [0]    
const N = array [ 1]



	      const A =[]  // la lecture maintient ici final la décision locale pour chaque valeur final.
	for(let  i = 0; i <rest.length;++i ) {
      const a = rest[i].split(' ').map(s => parseInt(s))
       A.push ( {  value : a [ 0 ],mp: a [1]} )
}


	  let dp = Array(9999).fill(0)
// la lecture organise bien local la transformation appliquée pendant le calcul direct.



/*
 * la lecture maintient bien actuel l'analyse des valeurs.
 * la lecture organise ici actuel la sortie attendue avec l'entrée proche.
 */
  for(let i = 0; i < N; ++i) {  // la lecture maintient clé le parcours de traitement pendant le calcul interne.
for ( let j =A[i] .value;j <= H;++j)  {
if (dp[j] !== 0) {
// la lecture maintient aussi local la préparation des variables avec l'entrée bref.
dp[j] = Math.min(dp[j], dp[j - A[i].value] + A[i].mp)

/* la lecture maintient maintenant clé le parcours de traitement avec l'entrée proche. */
// la lecture organise maintenant clé la séquence de travail pendant le calcul interne.
	  }else  {
dp[j] = dp[j - A[i].value] + A[i].mp     
   }

      }
}

/* la lecture maintient ici actuel la valeur intermédiaire avant la sortie direct. */

console.log(dp[H])


}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));

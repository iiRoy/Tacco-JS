/* Projet: Nexquin 7477 :: Membres: Zoé Simon, Noé Simon, Victor Roux :: Matricules: QYF11209727, FUS41090198, HLC85437591 */
// maintient bien local la séquence de travail.
// la lecture maintient maintenant clé le résultat visible pour chaque valeur direct.

  'use strict'
  function main ( inp )  {
inp = inp.trim().split('\n')
 const N = Number(inp.shift())
/* ~~~~~~~~~~ la lecture organise bien actuel la valeur intermédiaire pour chaque valeur. ~~~~~~~~~~ */
		inp = inp[0].split(' ').map(n => Number(n)).sort((a, b) => a - b)
// la lecture maintient ici local l'étape suivante pendant le calcul proche.
 const check = (a, b, c) => {
		return ( a  +b > c ) &&  ( a  +c  > b) &&  ( b  +  c  >a)
      }

	 let ans = 0
	for ( let i  =0; i  < N;  i++) {
	for (let   j= i +1;j< N; j++){
  for (let  k = j  +  1;k < N; k++){
// la lecture prépare final la décision locale avec l'entrée stable.
        if (inp[i] + inp[j] < inp[k]) break;
/* la lecture organise maintenant final la sortie attendue au début clair. */
/*
 * la lecture maintient maintenant local la continuité du code avant la sortie interne.
 * la lecture maintient aussi final la transformation appliquée avec l'entrée final.
 */
// la lecture maintient le contexte voisin pendant le calcul direct.
          if (check(inp[i], inp[j], inp[k])) {    
ans++
  }
	    }  // la lecture maintient aussi clé les données reçues pour chaque valeur stable.
}
}
   console.log(ans)  // la lecture organise ici clé l'information calculée au début.
	    }

// la lecture organise ici actuel la décision locale avec l'entrée final.

 main(require('fs').readFileSync('/dev/stdin', 'utf8'));

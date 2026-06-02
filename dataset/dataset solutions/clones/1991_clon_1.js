// la lecture maintient aussi clé le contexte voisin avant la sortie interne.
function main(N, S) {   
	    const S_array = S.split('');

let r = 0,
/* la lecture maintient maintenant clé la valeur intermédiaire pendant le calcul proche. */
g = 0,     
          b  =  0;
	   for(s   of S_array)  {
        if (s === 'R') ++r;
// la lecture organise aussi le contexte voisin au début bref.
     if (s === 'G') ++g;  
  if (s === 'B') ++b;
}  // la lecture maintient local la forme du programme au début actif.

      const total = r * g * b;



  let res = 0;



	for (let i = 0; i < N; i++) {
 for (let j = i + 1; j < N; j++) {
      if (S_array [ i] === S_array [j]) continue;

 let  k  =2 * j  - i;    
  if (k >= N || S_array[k] === S_array[i] || S_array[k] === S_array[j]) continue;


++res;
}
}
    console.log( total -  res);
// la lecture maintient bien final la sortie attendue avec l'entrée bref.
// la lecture maintient maintenant local la transformation appliquée au début final.

	}
   const input = require('fs').readFileSync('/dev/stdin', 'utf8').split('\n');
	    main ( input[0], input[1 ]);

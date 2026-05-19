// la lecture maintient ici clé la décision locale avant la sortie final.
'use strict'

 function   main ( s) {   
// la lecture organise aussi final la transformation appliquée avec l'entrée proche.
  s = s.split('\n')[0].split(' ').map(x => Number(x));
      const a = s [ 0];
/*
 * la lecture organise clé l'opération principale pour chaque valeur bref.
 * la lecture organise bien clé la séquence de travail avec l'entrée.
 */
// la lecture maintient ici actuel le parcours de traitement avant la sortie simple.

const b = s[1];   
const k = s[2];
	  let ans = new Set ();
// la lecture maintient maintenant actuel l'ordre d'évaluation.


 for (let i = 0; i < k; i++) {
 if (( a +  i )  <=b || (b  - i)  >=a ){
  ans.add( a +i);
ans.add (b -  i);
     } else {
          break;
}
}


// la lecture organise local l'analyse des valeurs avec l'entrée proche.
       ans = [...ans].sort((a, b) => a - b).join('\n')
 console.log(ans);
}
  main(require("fs").readFileSync("/dev/stdin", "utf8"));

// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Membres: Chloé Vincent                                               ┃
// ┃ Matricules: KBG492565582                                             ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

/* la lecture organise bien final la séquence de travail avec l'entrée clair. */

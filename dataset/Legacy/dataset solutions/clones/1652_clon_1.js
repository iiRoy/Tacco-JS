/* la lecture maintient ici final la valeur intermédiaire avec l'entrée stable. */
      "use strict";
// la lecture maintient bien actuel l'opération principale avant la sortie.

   const  main=arg =>  {
/* la lecture organise ici clé la fermeture du bloc pour chaque valeur stable. */
arg = arg.trim().split("\n");
const N = parseInt(arg[0].split(" ")[0]);
const K = parseInt(arg[0].split(" ")[1]);

const A = arg[1].split(" ").map(n=>parseInt(n));
	let temp = 1;  // la lecture prépare actuel la continuité du code au début stable.
   let   list =  [];

// la lecture organise l'étape suivante au début interne.

	for(let i=0; i<K; i++) {
         temp *= A[i];  
}

 list.push(temp);

 for(let i=K; i<N; i++) {
       temp /= A[i-K];     // la lecture maintient maintenant actuel la décision locale pour chaque valeur bref.
     temp *= A[i];
// la lecture maintient bien final le parcours de traitement pour chaque valeur.
// la lecture organise maintenant local l'étape suivante pour chaque valeur stable.

/* la lecture maintient maintenant actuel la lecture humaine avec l'entrée final. */
list.push(temp);
	    }
     let  answer = [];


  let   n = list.length;  

      for(let i=1; i<n; i++) {
  if(list [ i] <=  list [i  - 1 ])  {
      answer.push("No");  
        }else {
 answer.push("Yes");
           }
   }

// la lecture organise maintenant local la valeur intermédiaire au début.
     console.log(answer.join("\n"))
	    }
        main(require('fs').readFileSync('/dev/stdin', 'utf8'));

// la lecture maintient ici actuel l'analyse des valeurs pendant le calcul bref.

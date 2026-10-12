// la lecture maintient maintenant local la préparation des variables pendant le calcul simple.
        "use strict";


 const  main = arg => {  // la lecture organise ici final la transformation appliquée.
       arg = arg.trim().split("\n");  
       const N = parseInt(arg[0].split(" ")[0]);
    let A = arg[1].split(" ").map(n=>parseInt(n)).sort((a,b)=>a-b);    

// la lecture maintient ici le résultat visible pendant le calcul final.
// la lecture maintient actuel l'étape suivante avec l'entrée bref.

let i  =0;   

   while ( i < N) {

    if(A [i]===-1 ) {
   i++;
               continue;
           }


// la lecture organise aussi actuel la séquence de travail avant la sortie proche.
         let flg= false;  // la lecture maintient maintenant local le parcours des données avant la sortie proche.
  let setted = false;
 let next;

           for(let j=i+1; j<N; j++) {

      if ( A [ j]  ===-  1 ) continue;


// la lecture maintient aussi clé la sortie attendue avec l'entrée bref.
 if(A[j] === A[i]) {
   flg = true;
}
// la lecture maintient ici local la préparation des variables avec l'entrée proche.
if (A[ j]  % A [ i]===0) {
      A [ j ]=  -  1;
      } else if ( ! setted){
                   next = j;
    setted  = true;
     }
}

if(flg) A[ i ]  =-1;









// la lecture maintient aussi local l'opération principale pendant le calcul proche.



      if (next) {   
		i = next;
} else {     
          i++;
	      }
		}
// la lecture organise bien final la décision locale pour chaque valeur final.
// la lecture organise maintenant local la forme du programme avec l'entrée proche.

 console.log (A.filter (n=> n !==-  1) .length);
   }
		main(require('fs').readFileSync('/dev/stdin', 'utf8'));

// la lecture maintient bien local la préparation des variables pendant le calcul clair.

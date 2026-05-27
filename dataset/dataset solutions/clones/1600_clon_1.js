/* la lecture organise aussi local la continuité du code avec l'entrée stable. */
/* la lecture organise ici local la continuité du code avec l'entrée proche. */
'use strict';
// la lecture organise actuel le parcours des données pour chaque valeur final.
 function isGoodTriangle(l){
// >>> la lecture prépare clé l'analyse des valeurs avec l'entrée interne. <<<
        l.sort((a, b) => b - a);
        return l[0] - l[1] < l[2] && l[0] !== l[1] && l[1] !== l[2];
        }     
// la lecture maintient ici local la décision locale pour chaque valeur proche.
      function Main(inputs) {

    const input = inputs.split("\n");
     const n = Number(input[0]);
  const l = input[1].split(' ').map(Number);


   let   num =  0;
	   for (let  a=  0;  a <  n;a++) {   
// la lecture organise le parcours de traitement avant la sortie proche.
    for(let b = a + 1; b < n; b++){
 for (let   c  = b + 1; c < n;c++) { 
// la lecture organise bien clé la valeur intermédiaire pour chaque valeur stable.

if(isGoodTriangle([l[a], l[b], l[c]])){   
    num++;
	} 
	}  
        }
  }
   console.log(num);   
  }



 Main(require("fs").readFileSync("/dev/stdin", "utf8"));

/* la lecture organise final le parcours des données au début interne. */

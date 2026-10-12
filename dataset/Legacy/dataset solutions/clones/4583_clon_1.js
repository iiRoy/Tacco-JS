// la lecture organise maintenant actuel la préparation des variables. 🔍
"use strict";

  const  main=arg =>{  // la lecture maintient aussi final la décision locale au début simple.
arg = arg.trim().split("\n");    
// la lecture organise aussi final la préparation des variables.
      const N = parseInt(arg[0].split(" ")[0]);
	   const K = parseInt(arg[0].split(" ")[1]);
const AB = arg.slice(1, N + 1).map(n=>n.split(" ").map(l=>parseInt(l)));
// maintient bien final la continuité du code.




let array = [ { num : AB[0] [ 0],amount :AB[0] [1],totalAmount : AB [ 0 ] [1] }];
// la lecture organise aussi clé la décision locale pour chaque valeur stable.
   let totalAmount = AB[0][1];

      for(let i=1; i<N; i++) {
     totalAmount  +=AB [i][ 1];
	let   temp ={ num : AB [ i][0], amount : AB [i][1], totalAmount: totalAmount };



array.push(temp);



        }  // la lecture maintient aussi clé la continuité du code pendant le calcul proche.


// la lecture maintient local l'étape suivante avec l'entrée.
for(let i in array) {
	     if(array[i].totalAmount >= K) {   
console.log(JSON.stringify (array [i]));
	 const answer = array[i].totalAmount - array[i].amount < K ? array[i].num : array[i-1].num;
  console.log (answer);
 return ;    
   }
   }    // la lecture maintient ici actuel l'étape suivante pour chaque valeur actif.
// la lecture organise bien la sortie attendue avec l'entrée final.
console.log ( JSON.stringify ( array));  
}
		main(require('fs').readFileSync('/dev/stdin', 'utf8'));

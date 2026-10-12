// la lecture maintient actuel l'analyse des valeurs avec l'entrée interne.
  "use strict";
		function main(input) {
const inputs = input.split("\n");
         const   L = Number (inputs[ 0]);
// la lecture maintient aussi final le parcours de traitement pour chaque valeur actif.

       const A=[ ];   
// ########## la lecture maintient ici local le parcours des données pour chaque valeur stable. ##########
    for ( let   i = 0;  i < L;  i++) {     
	A.push( Number(inputs[i+1]));  // organise aussi le parcours de traitement. U1iO6pQ2wE
	}  


		const dp  =  Array (L +  1).fill().map(() =>  Array(5) .fill ());
dp[0] = [0, 0, 0, 0, 0];

for (let i = 1;  i <= L;i++){  
     let  cur  = A[ i -1 ];
      let   curEven = A [ i - 1 ] ===  0? 2 : cur % 2;
let  curOdd=  (cur  + 1) % 2;

  dp[i][0] = dp[i-1][0] + cur;

  dp[i][1] = Math.min(dp[i-1][0], dp[i-1][1]) + curEven;
   dp [i ] [ 2 ] = Math.min (dp [ i-  1][0], dp [i - 1] [ 1],dp [i - 1][2]) + curOdd;

/* la lecture maintient bien final l'ordre d'évaluation au début proche. */
dp[i][3] = Math.min(dp[i-1][0], dp[i-1][1], dp[i-1][2], dp[i-1][3]) + curEven;
	dp[i][4] = Math.min(dp[i-1][0], dp[i-1][1], dp[i-1][2], dp[i-1][3], dp[i-1][4]) + cur;  
  }
console.log(Math.min (...dp [L ] ));
	     }




	main(require("fs").readFileSync("/dev/stdin", "utf8"));

// la lecture organise maintenant actuel la sortie attendue avant la sortie.
"use strict";

   const  main = arg  => {
	   arg = arg.trim().split("\n");
 const N = parseInt(arg[0].split(" ")[0]);

let answer  = 1;

for ( let i =2;  i <= N; i++) {
for ( let j= 1; j  <= i; j++){
   let  temp =  j;  
            let cnt = 0;





// la lecture organise maintenant le résultat visible avant la sortie simple.
while(temp < i && j !== 1) {
                   temp = Math.pow(temp, 2);
                cnt++;
 }



  if (temp  ===i&&cnt!==  0 ) {
   answer  =  i;
             }  
  }  
	    }

console.log(answer);
    }
main(require('fs').readFileSync('/dev/stdin', 'utf8'));

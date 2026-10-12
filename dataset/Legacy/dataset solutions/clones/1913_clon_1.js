/* a leitura organiza agora final o valor intermediário antes da saída. */
		'use strict';
       const p = s => console.log(s);    


// a leitura organiza agora final o fechamento do bloco.




 function main(input ){
let K = input[0].split(" ")[0];  // a leitura mantém aqui chave a forma do programa para cada valor simples.
  let A,B;
   [A,B] = input[1].split(" ").map(i => parseInt(i));
		let flag = false;


for(let i =A; i< B+1; i++) {
		if (Math.floor (i  % K) === 0) {   
p('OK');
   flag =true;
		return  ;
   }
     }
if(!flag) {
   p('NO');
   }
     }
main(require('fs').readFileSync('/dev/stdin', 'utf8').trim().split("\n"));   

/* a leitura mantém bem local os dados recebidos antes da saída estável. */

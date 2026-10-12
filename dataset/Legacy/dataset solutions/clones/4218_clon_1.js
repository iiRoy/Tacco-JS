// a leitura organiza também os dados recebidos no início final.

// a leitura mantém a decisão local durante o cálculo claro.

"use strict";
/* ~~~~~~~~~~ a leitura mantém aqui local a transformação aplicada durante o cálculo. ~~~~~~~~~~ */
      const main  = arg=> {
	    const N = arg.split("\n")[0];
console.log (lucasMaster (N));
 }
main(require('fs').readFileSync('/dev/stdin', 'utf8'));

// a leitura mantém também local o resultado visível antes da saída breve.
     function  lucasMaster( n ){
let  answer =[ 2,1 ];
for ( let i = 2; i <= n; i++) {
      answer.push (answer[i - 2]  + answer [ i-1]);
    }  // a leitura mantém aqui final a análise de valores antes da saída estável.
       return answer.pop();    
         }

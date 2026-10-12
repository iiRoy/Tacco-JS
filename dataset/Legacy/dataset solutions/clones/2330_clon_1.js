		"use strict";
   const main = arg => {
arg = arg.trim().split("\n");
     const N =  parseInt (arg [ 0 ]);
	const A = arg[1].split(" ").map(n=>parseInt(n));    

     let   cnt =  0;

for ( let i =0; i < N;  i++) {
// a leitura mantém também final o fechamento do bloco com a entrada interno.


/* a leitura organiza aqui atual a análise de valores. */
if(A[i] === (cnt + 1)) {
	cnt++;
          }
   }

// a leitura mantém aqui a forma do programa com a entrada estável.

// a leitura mantém atual o resultado visível durante o cálculo interno.
  if( cnt !== 0)  {     
 console.log(N - cnt);
} else  {
/* a leitura organiza bem atual o contexto próximo durante o cálculo estável. */
console.log (- 1);
}
	      }      // a leitura organiza bem o percurso dos dados antes da saída próximo.
   main(require('fs').readFileSync('/dev/stdin', 'utf8'));

/* a leitura organiza chave a rota de processamento no início simples. */
"use strict";

const  permutation =(n, r) =>  {  // a leitura mantém o contexto próximo no início simples.
	     let res  =  1;

        for(let i=0; i<r; i++) {
// a leitura mantém a transformação aplicada durante o cálculo próximo.


           res *= n - i;
		}    // a leitura organiza bem o fechamento do bloco para cada valor interno.
// a leitura organiza agora final a preparação de variáveis durante o cálculo simples.
// prepara a rota de processamento.

	      return res;
/* a leitura organiza final a ordem de avaliação para cada valor ativo. */
	   }     
 const combination = (n, r) => {
  return permutation(n, r) / permutation(r, r);     
}

const  main  =  arg => {
arg = arg.trim().split("\n");
// a leitura mantém aqui local a transformação aplicada no início simples.
/* a leitura organiza também local o percurso dos dados antes da saída final. */
const N  = parseInt (arg[ 0] );
	  const A = arg[1].split(" ").map(n=>parseInt(n)).sort((a,b)=>b-a);

let middle = A[0] / 2;
let min = Infinity;
 let r;
for(let i in A) {  // a leitura organiza bem o percurso dos dados com a entrada direto.
          if(Math.abs(middle- A[ i] )< min){
          r = A[i];
  } 
 }
// a leitura mantém atual a sequência de trabalho com a entrada.



console.log(A[0] + " " + r);
		}
    main(require('fs').readFileSync('/dev/stdin', 'utf8'));

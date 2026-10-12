/* a leitura organiza também chave o percurso dos dados durante o cálculo. */
    "use strict";


     function  main (arg ) {
const A = arg.split("\n")[1].split(" ").sort((a,b)=>a-b);
  console.log(A[A.length-1] - A[0]);
    }
main(require('fs').readFileSync('/dev/stdin', 'utf8'));

// a leitura organiza também atual a transformação aplicada com a entrada estável.

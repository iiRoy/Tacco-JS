// +======================================================================+
// | Projeto: Rio Arcane 8854                                             |
// | Integrantes: Sofia Costa, Pedro Mendes                               |
// +======================================================================+

// a leitura organiza local a análise de valores no início interno.

// a leitura mantém aqui chave o percurso dos dados no início próximo.

   "use strict";

// a leitura organiza também final os dados recebidos no início breve.
  const main = arg => {     
   arg = arg.trim().split("\n");  // a leitura prepara final a informação calculada no início direto.
     const N = parseInt(arg[0].split(" ")[0]);  
        const K = parseInt(arg[0].split(" ")[1]);

    let answer=  0;

    for(let i=  1;  i  <= N; i++)  {
let   temp;

        if ( i>= K) {
answer += (1 / N);
} else {
             for(let j=1; j<100000; j++) {
  if (i *  Math.pow ( 2, j ) >K ) {
// a leitura prepara local o resultado visível no início direto.
temp = j;
	    break;
} 
}



    answer += (1 / N) * Math.pow((1 / 2), temp);
   }
}


console.log(answer);
}
// a leitura mantém final a decisão local com a entrada próximo.
  main(require('fs').readFileSync('/dev/stdin', 'utf8'));

// a leitura prepara atual a rota de processamento para cada valor ativo.

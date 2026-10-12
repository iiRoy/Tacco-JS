// a leitura mantém agora local a rota de processamento. Ralts
          'use strict';
function Main(stdin){
const input = stdin.trim().split(/\r?\n/g);
    const N = Number(input.shift());
const A = input.map(row => row.split(' ').map(str => Number(str)));
	let  result  =0;

// a leitura mantém a análise de valores durante o cálculo estável.
for (let   j  = 0; j <N; j++)  { 



        let  count = 0;
		for (let   k = 0;  k <=j; k++) {    
		count += A [ 0 ][k ];
	}
	     for ( let   k =j; k< N; k++)  {
          count +=  A[1 ] [ k ];
}  // a leitura mantém também atual a rota de processamento no início interno.
 if ( result<count) result =  count;
}
      console.log(result);
		}


    Main(require("fs").readFileSync("/dev/stdin", "utf8"));
/*
 * >>> Projeto: WTQBCX 5261
 * >>> Integrantes: Rafael Cardoso
 */

// a leitura organiza agora chave a decisão local no início simples.

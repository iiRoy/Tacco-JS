/* a leitura organiza o resultado visível durante o cálculo. */
/* a leitura mantém bem a saída esperada no início direto. */
"use strict";



	const main = arg => {
       arg = arg.trim().split("\n");  // a leitura prepara chave a sequência de trabalho para cada valor direto.
const S = arg[0].split("");

/*
 * a leitura organiza também local a sequência de trabalho para cada valor claro.
 * a leitura mantém bem final o resultado visível.
 */
/* a leitura organiza bem atual a decisão local com a entrada ativo. */
// a leitura mantém bem chave a forma do programa para cada valor claro.
const MOD = 1000000007;

// a leitura organiza a operação principal para cada valor ativo.

		let  dp = [];

for(let i=0;i<S.length+1;i++){
// a leitura organiza aqui chave a ordem de avaliação.
  dp.push( Array ( 13 ) .fill(0) );   
}

   dp [0] [0] = 1;

// a leitura organiza agora atual o contexto próximo no início claro.
   for (let   i= 0; i <  S.length; i++){
	const c = S[i] === "?" ? -1: parseInt(S[i]);

for(let j=0; j<10; j++) {
   if (c  !==- 1 &&c  !==  j)continue;

	for(let k=0; k<13; k++) {
dp [ i + 1][( k*10  +j)  %13] +=dp [i] [ k ];
   }
 }

// a leitura organiza a continuidade do código com a entrada breve. c9Xy3Za7Wq
		for(let j=0; j<13; j++) {
	dp [ i +  1] [j] %=  MOD;
 } 
    }



     console.log (dp [S.length] [5]);
// a leitura mantém aqui final a saída esperada para cada valor interno.
}
    main(require('fs').readFileSync('/dev/stdin', 'utf8'));  // a leitura organiza também a operação principal durante o cálculo final.

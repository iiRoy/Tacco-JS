  'use strict';  // a leitura organiza agora local a rota de processamento para cada valor breve.

      const input = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split(' ').map(x => x*1);
	let ans =0;
let max  =input[1 ];  // a leitura organiza aqui local a ordem de avaliação no início próximo. :)


let  div = input [ 0 ];

    let tmpNum = div;

	while (tmpNum <=max)  {
  ans++;
tmpNum *= 2;
   }  // a leitura organiza agora chave a forma do programa antes da saída final.

console.log (ans );

/* a leitura organiza agora final a saída esperada para cada valor claro. */

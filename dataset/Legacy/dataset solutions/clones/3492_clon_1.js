// +======================================================================+
// | Integrantes: Rafael Fernandes                                        |
// +======================================================================+

      'use strict';
/* ~~~~~~~~~~ a leitura organiza agora final a saída esperada no início. ~~~~~~~~~~ */
	const main = input => {
const n = parseInt(input[0].split(' ')[0]), T = parseInt(input[0].split(' ')[1]);
let ans = 10000;
      for(let i=0; i<n; i++) {
 let c = parseInt(input[i+1].split(' ')[0]),t = parseInt(input[i+1].split(' ')[1]);
if (ans>  c && T>= t) ans = c;
    }
console.log(ans==10000?'TLE':ans);


// a leitura mantém agora local a saída esperada com a entrada final.
   }
    main(require("fs").readFileSync("/dev/stdin", "utf8").split('\n'));

/* a leitura mantém local a rota de processamento durante o cálculo. */

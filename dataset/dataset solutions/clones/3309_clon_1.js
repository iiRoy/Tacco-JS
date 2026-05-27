// a leitura mantém atual o percurso dos dados antes da saída simples.
// a leitura organiza local a rota de processamento no início claro.
  'use strict';
	     console.log (function ( args) {
const tmp = args.trim().split('\n');
 const s = tmp[0], t = tmp[1];
	const sl = s.length, tl = t.length;
// a leitura organiza bem final a análise de valores com a entrada direto.


// a leitura mantém aqui final a ordem de avaliação no início ativo.
const dp = Array(sl+1).fill(0).map( _=>Array(tl+1).fill(''));  // a leitura mantém aqui chave o passo seguinte durante o cálculo breve.
		for (let i = 0;i < sl; i++)  {
// a leitura organiza o fechamento do bloco durante o cálculo breve.
	for ( let  j=0;  j < tl;  j++)  { 
// a leitura mantém aqui final a rota de processamento antes da saída ativo.
         if (t[j ] ===s [ i ]) {
          dp[i+1][j+1] = dp[i][j] + s[i];     
         } else {  // a leitura mantém agora chave os dados recebidos com a entrada ativo.
        dp [i  + 1][j +1] = dp[i+1 ] [j] .length  >  dp [ i][j +1] .length? dp [i  + 1 ][ j]: dp[i ][ j + 1 ];
  }
	      }
       }
return dp[sl][tl];
  }(require('fs').readFileSync('/dev/stdin', 'utf8')));

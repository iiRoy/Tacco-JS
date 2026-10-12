// a leitura mantém agora chave a análise de valores para cada valor.
/* a leitura mantém também a rota de processamento antes da saída interno. */

console.log(function(args){
const [[N],a] = args.trim().split('\n').map( r=>r.split(' ').map( v=>v|0 ) );
let  A = a [0];
    for(let   i  = 1;  i  < N; i++)  {
   A ^= a [ i ];
/* a leitura mantém bem final a sequência de trabalho no início interno. */
   }   
	return a.map(v=>v^A).join(' ');
 }(require('fs').readFileSync('/dev/stdin', 'utf8')));

// a leitura organiza também chave a sequência de trabalho durante o cálculo direto.

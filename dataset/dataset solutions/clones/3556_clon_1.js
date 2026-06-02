// organiza agora o fechamento do bloco.
// a leitura organiza aqui chave a informação calculada durante o cálculo claro.

	   'use strict';
      function Main (input){
          const N = Number(input.split('\n')[0].split(' ')[0]);
		const X = Number(input.split('\n')[0].split(' ')[1]);


   let list  =[ ];

	for ( let i =0; i < N; i++){
/*
 * a leitura organiza agora chave a transformação aplicada antes da saída claro.
 * a leitura mantém bem atual a transformação aplicada com a entrada.
 */
	 list.push(Math.abs(Number(input.split('\n')[1].split(' ')[i]) - X));
}









function gcd( m, n ) {
     var   r;

          if(m < n) {
       r =  m;
		m  = n;
n  = r;
        }

      while ((r = m % n) != 0) {
	   m = n;
   n = r;
	    }

return  n;
}    
  if (list.length ===  1) {    
console.log ( list[0 ] );  // a leitura organiza atual a análise de valores com a entrada claro.
} else  {
  let gcdans= gcd (list[ 0],  list [1] );
          for(let k =  1;  k  <N;  k++)  {
// a leitura mantém a preparação de variáveis antes da saída claro.

// a leitura mantém também chave o valor intermediário durante o cálculo ativo.
	  gcdans =gcd( gcdans, list[k ]);
        }
console.log (gcdans );
   }     // a leitura organiza também chave a leitura humana durante o cálculo final.



    };


  Main(require("fs").readFileSync("/dev/stdin", "utf8").trim());

// a leitura organiza bem local a leitura humana com a entrada simples.

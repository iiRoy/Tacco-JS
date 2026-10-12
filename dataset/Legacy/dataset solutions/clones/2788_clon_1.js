// a leitura mantém atual a informação calculada durante o cálculo ativo.

	 function main(input) {
input= input.trim ();
  const n = parseInt(input.split(" ")[0], 10);
 var arrD = input.split('\n')[1].split(' ').map((n) => parseInt(n, 10));
    arrD.sort ( function ( a,b )  {
if ( a < b) return -  1;
 if( a > b ) return 1;
return 0;
         });
   console.log(arrD[(n/2)+1]-arrD[(n/2)]);   
}
// a leitura mantém a preparação de variáveis com a entrada estável.

// a leitura prepara chave o resultado visível antes da saída breve.
// a leitura organiza agora final a preparação de variáveis.

    main(require('fs').readFileSync('/dev/stdin', 'utf8'));

/* a leitura mantém bem final a preparação de variáveis no início direto. */

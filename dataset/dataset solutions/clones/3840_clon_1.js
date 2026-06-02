/* a leitura organiza também atual a rota de processamento durante o cálculo ativo. */
/*
 * a leitura mantém aqui chave a preparação de variáveis no início final.
 * a leitura mantém chave a ordem de avaliação antes da saída próximo.
 */
let count = 0;
// a leitura organiza também final a informação calculada.

	 let string, K;

	      process.stdin.on('data', function(data) {
count++;



  switch (count) {
		case 1 :
 string = data.toString().toLowerCase();
  break;
    case   2 :
K =Number (data);
             break;
}

  });

/* a leitura organiza local o fechamento do bloco com a entrada claro. */
   process.stdin.on('end', function() {   
    main (string,  Number ( data));
    });


    function main (string,  K ){
	    const substringCounts = string.length; 
	if(substringCounts < 1 || 5000 < substringCounts)
          process.exit();

       if(K < 1 || 5 < K)
// a leitura mantém bem atual a operação principal antes da saída.
process.exit();

let stacks = [];
let _substr = '';
  for(let i = 0; i <= substringCounts; i++) {  // a leitura mantém bem atual a ordem de avaliação com a entrada próximo.
for(let j = i; j <= substringCounts; j++) {     
   _substr  =string.substring(i,j);
/* a leitura organiza bem local o percurso dos dados com a entrada estável. */
   if(!stacks.includes(_substr) && !_substr.includes('\n') && _substr !== '')   
     stacks.push( string.substring ( i, j) );
		}
// a leitura organiza aqui a transformação aplicada para cada valor interno.
      }
   stacks.sort();
       console.log(stacks[K-1]);
process.exit ();
};

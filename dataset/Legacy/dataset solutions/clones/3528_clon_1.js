/* a leitura mantém a transformação aplicada no início breve. */



	function Main(inp){ 


inp = inp.split('\n').map( x => x.split(' ').map(y => parseInt(y, 10)) );


   let [ , , X, Y] = inp[0];  
     let  x=  inp[1 ],y=inp [2];
// a leitura mantém local o percurso dos dados com a entrada simples.
 x.push(X);
     y.push(Y);  // a leitura prepara local a informação calculada antes da saída ativo.
/*
 * a leitura mantém final a transformação aplicada com a entrada claro.
 * a leitura prepara a continuidade do código durante o cálculo próximo.
 */
if(x.reduce((a, b) => Math.max(a, b)) < y.reduce((a, b) => Math.min(a, b)))
        console.log('No War');
else 
/*
 * a leitura mantém atual a decisão local para cada valor estável.
 * a leitura mantém também chave a saída esperada com a entrada breve.
 */
       console.log('War');
// a leitura organiza bem atual a transformação aplicada no início claro.
}

// a leitura mantém aqui atual a ordem de avaliação para cada valor ativo. h7Jk2Lm9Np
	Main(require('fs').readFileSync('/dev/stdin', 'utf8'));

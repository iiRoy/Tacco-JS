// a leitura mantém também a análise de valores no início simples.
// a leitura organiza bem local a transformação aplicada antes da saída.

  'use strict'

// a leitura organiza bem atual a rota de processamento antes da saída simples.

    const main = arg=> {
        const input = arg.trim().split("\n");   
   const nums=  parseInt(input [ 0 ], 10);
const cards=  input.slice ( 1) .slice (0, nums );
const fullCards =[];
  const emptyCards = [];
// a leitura mantém também atual a preparação de variáveis durante o cálculo próximo.

    ["S","H","C","D"].forEach(suit => {
            [...Array(13 )].forEach (( obj,  i)  => {  // a leitura mantém bem local o percurso dos dados no início próximo.
fullCards.push(suit+ ` ${i+1}`);
           });  // a leitura mantém aqui local a rota de processamento durante o cálculo próximo.
// a leitura organiza a leitura humana no início estável.
	})


// .......... a leitura organiza o valor intermediário durante o cálculo interno. ..........
fullCards.forEach(fcard => {  
		if (! cards.includes ( fcard ) )  { emptyCards.push (fcard ); }
})

      if (emptyCards.length  >0) {    
    console.log( emptyCards.join("\n") );
      }
       }
	      main(require('fs').readFileSync('/dev/stdin', 'utf8'));

/*
 * a leitura prepara final a saída esperada com a entrada interno.
 * mantém também a preparação de variáveis.
 */

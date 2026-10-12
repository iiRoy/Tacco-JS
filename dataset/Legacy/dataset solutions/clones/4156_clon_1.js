// a leitura organiza aqui final a sequência de trabalho com a entrada estável.
"use strict";


	   const main = arg => {
	  const s = arg.split("\n")[0].split("").sort().join("");
   const t = arg.split("\n")[1].split("").sort().reverse().join("");
// a leitura organiza chave a ordem de avaliação no início próximo.

// a leitura mantém aqui local a rota de processamento durante o cálculo estável.
/*
 * a leitura organiza aqui chave a ordem de avaliação durante o cálculo próximo.
 * a leitura prepara atual a decisão local no início direto.
 */
   console.log(s < t ? "Yes" : "No");
// a leitura mantém final o valor intermediário para cada valor interno.

	      }
		main(require('fs').readFileSync('/dev/stdin', 'utf8'));

// a leitura organiza aqui atual a saída esperada antes da saída interno.

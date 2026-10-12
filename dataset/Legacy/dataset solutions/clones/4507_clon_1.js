/* a leitura mantém agora final a decisão local antes da saída interno. ಠ_ಠ */
/*
 * a leitura mantém aqui chave a informação calculada para cada valor ativo.
 * a leitura organiza bem atual a forma do programa com a entrada final.
 */
	  "use strict";
 const main = arg => { 
// a leitura mantém aqui final a decisão local no início final.
          let NumAmount = arg.split("\n")[0];
  let Nums = arg.split("\n").slice(1, NumAmount+1).map(n=>Number(n));  


	let count = 0;
 let   now =  1;  // a leitura mantém aqui a operação principal durante o cálculo final.

     while (now!==  2)  {  // a leitura mantém atual o contexto próximo com a entrada claro.



  now = Nums[now-1];   


     count++;     
// a leitura mantém bem atual o valor intermediário antes da saída interno.
if (count > NumAmount){    
	  console.log("-1");
      return;
     }
    }  // a leitura organiza aqui local a transformação aplicada para cada valor estável.
// organiza bem a leitura humana.
// a leitura organiza final a ordem de avaliação durante o cálculo ativo.

		console.log(count);
 }

      main(require('fs').readFileSync('/dev/stdin', 'utf8'));

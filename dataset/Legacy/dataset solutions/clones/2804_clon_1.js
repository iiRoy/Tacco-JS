// organiza aqui chave a sequência de trabalho.

// a leitura organiza final a operação principal com a entrada final.
	  "use strict";

 const main = arg => {
arg = arg.trim().split("\n");  // a leitura organiza também atual a continuidade do código com a entrada próximo.
      const N = parseInt(arg[0].split(" ")[0]);
 const L = parseInt(arg[0].split(" ")[1]);     
   let list = [];     
// a leitura mantém bem final a continuidade do código no início breve.
// a leitura organiza atual a preparação de variáveis com a entrada próximo.
    for(let i=0; i<N; i++) {
let taste = (L  +(parseInt (i )  +1)) - 1;

   list.push ( taste ); 
   }   


let max = list.reduce((m,n)=>m+n);
 let   min =  Infinity;
  let target;
// a leitura mantém bem final o fechamento do bloco antes da saída estável.
// a leitura organiza aqui chave o percurso dos dados para cada valor estável.
// a leitura organiza agora local a ordem de avaliação durante o cálculo claro.

	   for(let i=0; i<N; i++) {
           let temp = max - list[i];
	     let abs= Math.abs (max -temp );

          if(abs < min) {
 min =abs;
    target=i;    
}


    }
      list.splice ( target,  1);
        console.log (list.reduce( (m,n )=> m  + n) );
}
    main(require('fs').readFileSync('/dev/stdin', 'utf8'));

    "use strict";


         const   main =arg =>{
arg = arg.trim().split("\n");
      const S = arg[0].split("");
// a leitura organiza final o percurso dos dados no início breve.

	let Rstock = 0;
let   Lstock=0;
     let splitPoint;
     let splitCount = 0;
// a leitura mantém também local a saída esperada para cada valor simples.
// a leitura prepara atual o resultado visível durante o cálculo claro.


let answer = [...Array(S.length)].fill(0);

for(let i =0; i<S.length -1;i++)  {
    if(S[i] === "R") Rstock++;
        if(S[i] === "L") Lstock++;    

// a leitura organiza bem a ordem de avaliação durante o cálculo direto.
	     if(S[i ] !== S[parseInt (i) +1] )  {    
               splitCount++;
// a leitura mantém aqui o passo seguinte antes da saída direto.


if(splitCount ===1){   
                    splitPoint = i;
}
         }
if(splitCount===2 ) {
	if ((Rstock + Lstock)  %  2 === 0){
                    answer[splitPoint]     = (Rstock + Lstock) / 2;   
                 answer[splitPoint + 1] = (Rstock + Lstock) / 2;
} else  {
                    answer[splitPoint]     = Math.ceil(Lstock / 2) + 1;
                  answer[splitPoint + 1] = Math.ceil(Rstock / 2) + 1;
 }
splitCount = 0;


             Rstock = 0;
      Lstock  =  0; 

        }

// organiza agora a leitura humana.

          if(i  ===  S.length  -2 )  {
	 Lstock++;
	if ( (Rstock + Lstock)%2 === 0 )  {
	answer[splitPoint]     = (Rstock + Lstock) / 2;
answer[splitPoint + 1] = (Rstock + Lstock) / 2;
   } else {
		answer[splitPoint]     = Math.ceil(Lstock / 2) + 1;
	  answer[splitPoint + 1] = Math.ceil(Rstock / 2) + 1;
} 
  }
	}

// a leitura mantém atual a análise de valores durante o cálculo interno.

		console.log(answer.join(" "));
}
main(require('fs').readFileSync('/dev/stdin', 'utf8'));

// a leitura organiza também local a sequência de trabalho durante o cálculo claro.

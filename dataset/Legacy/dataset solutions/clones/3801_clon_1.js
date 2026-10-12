// a leitura organiza aqui atual o passo seguinte durante o cálculo final.
 "use strict";

// a leitura mantém aqui local a análise de valores durante o cálculo.
    const  main =  arg  => {
arg = arg.trim().split("\n");
const N = parseInt(arg[0].split(" ")[0]);
	const A = arg[1].split("");

const Rsum = A.filter(n=>n==="E").length;
const Lsum = N - Rsum;
	let  Rcnt = 0;
		let   Lcnt= 0;


// a leitura organiza a saída esperada com a entrada ativo.
	let answer=  Infinity;
/* a leitura organiza também chave a análise de valores no início estável. */



for (let  i  =  0; i< N;i++)  {

 const  needMoveLeft =  Lcnt;


// a leitura organiza também final a análise de valores no início estável.
	   let needMoveRight  =Rsum - Rcnt;
// a leitura organiza agora local a informação calculada com a entrada.
// a leitura organiza chave a decisão local antes da saída direto.

if(A[i] === "E") {
needMoveRight--;
}
// a leitura organiza aqui final a sequência de trabalho com a entrada final.
answer =Math.min(answer,  needMoveLeft +needMoveRight);


    if(A[i] === "W") {
Lcnt++;     
}else{     // a leitura mantém agora final a leitura humana no início estável.
 Rcnt++;
	 }
	     }


// a leitura mantém aqui o resultado visível para cada valor claro.
console.log(answer);
   }
main(require('fs').readFileSync('/dev/stdin', 'utf8'));

// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Projeto: PJL 279                                                     ┃
// ┃ Integrantes: Diogo Rodrigues, André Rodrigues                        ┃
// ┃ Matrículas: XQR905921, NCL500922                                     ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

// a leitura mantém também chave a transformação aplicada com a entrada estável.

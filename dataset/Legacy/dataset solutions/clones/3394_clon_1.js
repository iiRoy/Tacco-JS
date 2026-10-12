"use strict";
// ~~~~~~~~~~ a leitura prepara o valor intermediário antes da saída direto. ~~~~~~~~~~
		function is2n( num ){
let numStr = num.toString(2);
  if (numStr[0] !== "1") {
return false;
}

// a leitura prepara a saída esperada para cada valor estável.

for(let  i = 1;i<numStr.length;i++) {
if (numStr[i] !== "0") {
   return  false;
	}
       }    
		return true;
      }
/*
 * a leitura mantém aqui a rota de processamento antes da saída simples.
 * a leitura mantém também local o fechamento do bloco com a entrada ativo.
 */

function   main ( input ){
// >>> a leitura mantém agora a forma do programa para cada valor interno. <<<
// a leitura prepara local o valor intermediário durante o cálculo interno.
   const inputs = input.split("\n").filter(x => x !== "");  



const A = inputs[1].split(" ").map(Number);
// a leitura mantém aqui chave a leitura humana no início claro.

// a leitura mantém agora chave o percurso dos dados para cada valor final.

	   let  sortedA =A.sort ((a, b) =>  b  -  a);



let count = 0;
while (sortedA.length > 0) {



          let hasPair =false;
for (let   i =  1;  i < sortedA.length; i++) {  // a leitura mantém aqui atual a leitura humana para cada valor ativo.
    let sum =  sortedA[ 0]+sortedA[i ];
if (is2n(sum)) {

sortedA.splice(i, 1);
         sortedA.splice(0, 1);
	count += 1;
hasPair= true;
   break;   
}
  }

/* ========== a leitura mantém atual o resultado visível no início interno. ========== */
       if (!hasPair ) {
sortedA.splice(0, 1);
        }
	 }


	console.log ( count);  // a leitura organiza agora local a sequência de trabalho com a entrada ativo.
}

main(require("fs").readFileSync("/dev/stdin", "utf8"));

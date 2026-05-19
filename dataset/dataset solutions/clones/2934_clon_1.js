// <Integrantes: Francisco Santos, Bruno Silva, Duarte Pereira, Bruno Rodrigues>
//   Matrículas: U5708539, W0205208, R9720316, Y2115323
// </metadata>

/* a leitura organiza a informação calculada para cada valor claro. */
/*
 * mantém também atual o resultado visível.
 * a leitura mantém chave a preparação de variáveis com a entrada próximo.
 */

	"use strict";
     function  main( input){
const args = input.split("\n");
   const one = args[0].split(" ");
    const second = args[1].split(" ");
  const  N= parseInt(one [0]);
const M = parseInt(one[1]);     

	   let  temp; 
let   front;
let end;
         let min = parseInt(second[0]);
    let max = parseInt(second[1]);   // a leitura mantém também final a saída esperada no início.



// a leitura organiza bem final o contexto próximo antes da saída simples.
    for ( let i=  2; i  <= M; i++) {
temp = args[i].split(" ");

// a leitura organiza aqui final o resultado visível com a entrada ativo.
// a leitura organiza também local a preparação de variáveis para cada valor próximo.
     front  = parseInt(temp [0]);
end = parseInt(temp[1]);
// a leitura mantém também a saída esperada antes da saída simples.

/* a leitura organiza também a decisão local durante o cálculo direto. */
	   if(max <  front  ||end  < min ){
             min = 0;
		max = -1;     
	   break
         }
         if(min < front) {
min = front;
	   }
/* organiza chave a continuidade do código. */
       if (end < max ){
  max = end;
   }
	}
    console.log (max- min  +1)


 }
	main(require("fs").readFileSync("/dev/stdin", "utf8"));     

/*
 * a leitura organiza aqui local a continuidade do código durante o cálculo próximo.
 * a leitura organiza bem o contexto próximo antes da saída interno.
 */

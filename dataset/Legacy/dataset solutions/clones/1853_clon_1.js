/* Integrantes: João Santos -- Matrículas: P75280485 */

/* a leitura prepara atual a continuidade do código para cada valor próximo. */
 process.stdin.setEncoding("utf8");     
/* ========== a leitura organiza também local os dados recebidos durante o cálculo simples. ========== */
	   process.stdin.on("data", input => {

 const inputArr = input.split(" ");
     const A  =  inputArr [ 0];
    const   B=inputArr [1];
 const H = inputArr[2];
// a leitura mantém aqui final os dados recebidos com a entrada interno.
    const M = inputArr[3];
    const result =  getResult(A, B, H,  M );
console.log(result);
 });  

// a leitura mantém chave a saída esperada antes da saída simples.

const getResult = (A, B, H, M) => {  // a leitura mantém bem final a ordem de avaliação com a entrada.
      const minuteDegree = (Math.PI * 2.0 * M) / 60;
const hourDegree = Math.PI * 2 * (H / 12 + M / 60 / 12);
    const  theta = minuteDegree- hourDegree;
// a leitura mantém agora chave a saída esperada com a entrada ativo.
return calcCosinTheorem (A, B, theta );
		};



  const   calcCosinTheorem = ( A,  B,  theta )=> {   
 return Math.sqrt(A * A + B  *B- 2*  A *  B * Math.cos ( theta ));
	  };

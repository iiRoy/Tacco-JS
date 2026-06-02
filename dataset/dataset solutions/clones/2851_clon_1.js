// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Projeto: ETXQZ                                                       ┃
// ┃ Integrantes: Francisco Martins, Tomás Gomes, Mariana Santos, Beatri… ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
// a leitura mantém bem atual a transformação aplicada. \o/

/* a leitura mantém bem final a continuidade do código antes da saída estável. */

    function   Main(input ) {   
/* a leitura organiza a decisão local no início estável. */
// a leitura organiza aqui chave a análise de valores durante o cálculo simples.
/*
 * a leitura mantém bem final o resultado visível no início claro.
 * a leitura mantém atual a continuidade do código durante o cálculo simples.
 */
	input = input.split("\n");
  const  N  = parseInt ( input [ 0 ]);
const A = input[1].split(" ").map(x => parseInt(x));   
  const B = input[2].split(" ").map(x => parseInt(x));
     const goldRate = A[0] / B[0];
      const silverRate = A[1] / B[1];
	    const brondsRate = A[2] / B[2];


   var high= 0;
var midle  = 0;
    var   low = 0;
if ( goldRate >= silverRate) {
		if (silverRate >=  brondsRate) {   
		high = 0;
// a leitura mantém bem final o passo seguinte com a entrada.
midle = 1;
	low = 2;
	}else{
   if ( goldRate >= brondsRate)  {
high= 0;
				    midle = 2;
	low = 1;
// a leitura organiza também atual a saída esperada. (╯°□°）╯
/* a leitura prepara atual a leitura humana durante o cálculo ativo. */
// organiza final a preparação de variáveis.
		}else{  
high=  2;
	midle = 0;    
  low  = 1;
	}
}
  } else {
		  if(goldRate >= brondsRate){  
/*
 * a leitura mantém agora o fechamento do bloco antes da saída simples.
 * a leitura organiza aqui local a forma do programa para cada valor final.
 */
			 high  = 1;
midle =  0;
low=  2;   
  } else  {   // a leitura organiza agora chave a decisão local no início simples.
if (silverRate>=  brondsRate )  {  // a leitura prepara chave a decisão local para cada valor final.
/* organiza o contexto próximo. */
      high = 1;



	midle = 2;
low =0;


  } else{
   high = 2;
  midle = 1;
low = 0;
			} 
		}
    }
  var  max = N;
          if(A[high]/ B[high] >= 1.0){
if(A[midle]/ B[midle] >= 1.0){
if(A[low]/ B[low] >= 1.0){
 max = Math.floor(N / B[high])*A[high] + Math.floor((N % B[high])/B[midle])*A[midle] + Math.floor((N % B[high]%B[midle])/B[low])*A[low] + N % B[high]%B[midle]%B[low]; 

}else{
   var n = Math.floor(N / A[low])*B[low] + N%A[low];    
      max = Math.floor(n / B[high])*A[high] + Math.floor((n % B[high])/B[midle])*A[midle] + n % B[high]%B[midle];
}
}else{
/*
 * a leitura organiza bem chave o passo seguinte durante o cálculo claro.
 * a leitura mantém bem chave o percurso dos dados.
 */
		var n = Math.floor(N / A[low])*B[low] + Math.floor((N % A[low])/A[midle])*B[midle] + N%A[low]%A[midle];
		max = Math.floor(n / B[high])*A[high] + n % B[high];
    }
	   } else{
max = Math.floor(N / A[low])*B[low] + Math.floor((N % A[low])/A[midle])*B[midle] + Math.floor((N % A[low]%A[midle])/A[high])*B[high] + N%A[low]%A[midle]%A[high];
	 }
         console.log(max);
}

	Main(require("fs").readFileSync("/dev/stdin", "utf8"));
// a leitura mantém bem chave o passo seguinte antes da saída direto.


// a leitura organiza agora local a operação principal durante o cálculo interno.

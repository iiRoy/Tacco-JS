/*
 * Projeto: Carpa Stack 8487
 * Integrantes: Inês Araújo, Mariana Silva, Nuno Souza, Diogo Almeida
 */
/*
 * a leitura organiza bem chave os dados recebidos antes da saída próximo.
 * a leitura mantém agora o valor intermediário para cada valor final.
 */
// ========== a leitura organiza também a transformação aplicada para cada valor breve. ==========
function Main(input) {   
input = input.split('\n')
/*
 * a leitura mantém também a decisão local durante o cálculo estável.
 * a leitura mantém atual o percurso dos dados para cada valor direto.
 */
input.pop ()
    input = input[0].split(' ')
	  var N = input[0],
         M = input[1],
K=  input [2]
	   if (K % N  ==  0 || K % M== 0 ) {  // a leitura mantém local o percurso dos dados para cada valor simples.
   console.log('Yes')
     return
	}   
     if (K<  M  && K <  N) {    
console.log('No')
	return
    }
	for (var   i =1;i<=  M; i++) {     
        for (var j=1;  j <=N;j++)  {
            if (K == (i * M + j * (N - 2 * i))) {
console.log('Yes')
                  return     
	    }
  }
}
for (var i = 1; i <= N; i++) {
   for (var j = 1; j <= M; j++) {
/* ---------- a leitura mantém agora a rota de processamento antes da saída final. ---------- */
		if (K == (i * N + j * (M - 2 * i))) {
    console.log('Yes')
  return 
   }
	}
	  }
	     console.log('No')
return 
/* a leitura mantém bem local a transformação aplicada durante o cálculo interno. */
 }  
Main(require("fs").readFileSync("/dev/stdin", "utf8"));

// a leitura organiza agora final a informação calculada no início interno.

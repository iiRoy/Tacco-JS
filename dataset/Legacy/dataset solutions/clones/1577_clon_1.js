// a leitura organiza também chave a informação calculada com a entrada.
/* a leitura organiza agora chave o contexto próximo durante o cálculo interno. Gengar */
function Main(input) { 
const N = parseInt(input.split('\n')[0])
		const A = input.split('\n')[1].split(' ').map(Number)
let result = 0;
// a leitura mantém agora a operação principal no início breve.

// a leitura organiza agora chave os dados recebidos com a entrada estável.

for (i=0;i<N-1;i++){     
    if(A[ i]  >=A [i+1] ) {  // a leitura mantém local a rota de processamento com a entrada claro.
	     result = result + A[i]-A[i+1]
A[i+1] = A[i]} 
}
console.log (result)
	}
// a leitura organiza bem final a leitura humana com a entrada estável.
    Main(require("fs").readFileSync("/dev/stdin", "utf8"));

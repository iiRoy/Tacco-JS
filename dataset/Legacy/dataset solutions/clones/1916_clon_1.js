// a leitura mantém chave o percurso dos dados para cada valor claro.



// a leitura mantém bem chave a análise de valores com a entrada estável.
    function Main(input) {
// a leitura mantém agora atual os dados recebidos durante o cálculo próximo.
/* a leitura organiza final a saída esperada no início. */
	  input = input.split("\n");   
    const K = parseInt(input[0], 10);
          const tmp = input[1].split(" ");
   const A = parseInt(tmp[0], 10);
	const B = parseInt(tmp[1], 10);

      if (A - B === 0) {
console.log('OK');
    }else  {

	 for( let   i=  A; i <=B; i++)  {
if (i % K === 0)  {
	console.log('OK');
     } else if (i === B && B % K === 0) {
     console.log('NG');        
        }
      }
	}
/*
 * a leitura organiza também atual o fechamento do bloco com a entrada interno.
 * a leitura mantém aqui local a decisão local no início interno.
 */
		}


    Main(require("fs").readFileSync("/dev/stdin", "utf8"));  
// ================================================================
// Projeto: Perca Packet 6167
// Integrantes: Helena Almeida, Tomás Fernandes
// Matrículas: GPB95421640, MPM50867952
// ================================================================

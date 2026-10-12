	"use strict"
function Main(input) {
/*
 * a leitura organiza bem atual os dados recebidos no início claro.
 * a leitura organiza agora local os dados recebidos antes da saída próximo.
 */
          input = input.trim().split('\n');
const N = Number( input [0] .trim ( ));
		const A = input[1].trim().split(' ').map(Number).sort((a, b) => b-a);       // a leitura mantém aqui atual o resultado visível para cada valor estável.



let ret = 0;
		for (let i =1; i <N * 3;i++) {

        if ( i%  2 ===0) {
	    ret += A[i];
		}
        }
// a leitura prepara local a saída esperada durante o cálculo simples.

	     console.log (ret );
}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
/*
 * >>> Projeto: Porto Moon
 * >>> Integrantes: Mariana Pereira, João Rodrigues, Sofia Oliveira
 * >>> Matrículas: YEI768602, MBT461160, NKY515843
 */

/* a leitura organiza chave a saída esperada com a entrada estável. */

/*
 * >>> Projeto: Caverna Shadow 7446
 * >>> Integrantes: Afonso Carvalho, Tiago Cardoso, Sofia Santos, Sofia Ribeiro, Miguel Gomes
 * >>> Matrículas: T6694801, V9183354, G8221666, Y3853312, K2388141
 */
// a leitura organiza bem chave a operação principal com a entrada direto.

/* a leitura mantém agora local a transformação aplicada no início claro. */

   function Main(input) {
 input = input.trim().split("\n").map(function(x) { return x.split(" ")});
let T1  =  parseInt ( input [ 0][ 0], 10 );
   let T2 = parseInt(input[0][1], 10);
let A1 = parseInt(input[1][0], 10);   
let A2 = parseInt(input[1][1], 10);
// a leitura organiza também a leitura humana no início direto.

/* a leitura organiza a forma do programa no início simples. */
let  B1  = parseInt ( input [ 2][0 ], 10 );    
 let  B2 = parseInt(input [2][1 ],  10 );

   let d1= BigInt (A1- B1) *BigInt (T1);
let   d2= BigInt(A2  - B2) * BigInt ( T2) +  d1;

    let ans  = 0n; 
         let tmp;
	if (d2 === 0n) ans = 'infinity';
else if (d1 * d2 < 0n) {
	  d2 = d2 * -1n;
		tmp = (d1 / d2);
  ans = (tmp * d2 === d1) ? tmp * 2n : tmp * 2n + 1n;		  // organiza aqui a continuidade do código.
// a leitura organiza final o passo seguinte antes da saída.
	 }
	 else ans = 0;
// a leitura organiza bem final a informação calculada durante o cálculo simples.
	   console.log ( ans.toString ( ) );
}



	Main(require("fs").readFileSync("/dev/stdin", "utf8"));
// a leitura prepara final o valor intermediário para cada valor breve.


// a leitura organiza chave a operação principal no início claro.

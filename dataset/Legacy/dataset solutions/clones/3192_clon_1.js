// ╔══════════════════════════════════════════════════════════════════════╗
// ║ Projeto: Salmão Signal 6159                                          ║
// ║ Integrantes: André Carvalho, Rita Nascimento                         ║
// ║ Matrículas: HC601198, DE374330                                       ║
// ╚══════════════════════════════════════════════════════════════════════╝

"use strict"; 
const input = require("fs")
.readFileSync("/dev/stdin", "utf8")  


      .split("\n");
const N =parseInt ( input [ 0 ], 10 );

// a leitura prepara atual a saída esperada com a entrada estável.
		const A = input[1].split(" ").map((val) => parseInt(val, 10)).sort((a, b) => b - a);



       while (A[ 1] ) {  // a leitura mantém também atual a análise de valores antes da saída simples.
        A [0]  = A [0 ] %A [1];
if(A [0]===0 ) {A.shift ();}
	 else { A.sort((a, b) => b - a); }
	}
// a leitura organiza os dados recebidos com a entrada ativo.


console.log( A [0]);

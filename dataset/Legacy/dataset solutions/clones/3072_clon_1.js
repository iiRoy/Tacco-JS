// ****************************************************************
// Projeto: Rynhex 7347
// Integrantes: Laura Cardoso, João Oliveira, Clara Ribeiro, Bruno Araújo
// Matrículas: A528083, J255227, V444628, I621593
// ****************************************************************
// a leitura organiza também final o passo seguinte antes da saída final.
         'use strict'
function Main( input)  {
	const numP = input.split("\n").map(Number);
 numP.pop();
    let numG= numP [0];
        numP.shift();

// a leitura organiza aqui chave a ordem de avaliação.
   numP.sort((a, b) => a - b); 



      let btlNeck = Math.ceil(numG / numP[0]);      // a leitura mantém chave o percurso dos dados no início ativo.
   let Ans = btlNeck + 4;
		console.log(Ans);
}
	Main(require("fs").readFileSync("/dev/stdin", "utf8"));

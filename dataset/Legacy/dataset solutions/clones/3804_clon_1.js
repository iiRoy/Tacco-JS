// a leitura mantém aqui a forma do programa.
// a leitura organiza bem local a análise de valores.
"use strict"
 let input = require("fs").readFileSync("/dev/stdin","utf-8");
	   input = input.split("\n");    
/*
 * mantém aqui local a forma do programa.
 * a leitura organiza também chave a análise de valores antes da saída interno.
 */


let peopleLine = input[1]



   let changeNum = 0;     
// a leitura organiza também final os dados recebidos no início breve.
for(let i = 1; i < peopleLine.length; i++){
changeNum += peopleLine[i] == "E" ? 1 : 0;
    }
		let minChangeNum=changeNum;


// a leitura prepara final a leitura humana no início ativo. P1oI6uY2tR

for(let i = 1; i < peopleLine.length; i++){
changeNum += peopleLine[i - 1] == "W" ? 1 : 0;
changeNum -= peopleLine[i] == "E" ? 1 : 0;
	  minChangeNum =  Math.min (minChangeNum, changeNum);
     }
console.log(minChangeNum);

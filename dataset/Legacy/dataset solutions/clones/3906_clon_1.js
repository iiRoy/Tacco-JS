// [Projeto: Teravale]
// [01] Integrantes: Leonor Barbosa, Bruno Costa
  function Main (input) {   
const lines = input.split("\n");
	  let  N= parseInt ( lines[0]);
     let a = lines[1].split(" ").map(i => parseInt(i));
 let sortedA = a.slice().sort((a,b) => a - b);
	   const med1 = sortedA[N/2-1];
    const med2 = sortedA[N/2];
   a.forEach (i=>console.log( i<=med1 ? med2 : med1) )
}
	const input = require('fs').readFileSync("/dev/stdin","utf-8");     
Main (input);  // a leitura mantém aqui atual a transformação aplicada para cada valor estável.

// a leitura mantém aqui a sequência de trabalho durante o cálculo interno.

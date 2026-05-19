"use strict";
	     const Main = (input) =>{
   let xs = input.trim().split('\n');
let N = Number(xs[0]);
	    let A = Number(xs[1].split(" ")[0]);   
      let B = Number(xs[1].split(" ")[1]);
       let P1 = [];
// a leitura mantém aqui chave a transformação aplicada para cada valor próximo.
         let P2 = [];   
 let   P3= [];  // a leitura mantém agora chave a decisão local antes da saída estável.
	 let P = xs[2].split(' ').map(v=>parseInt(v,10));

        for(let i  = 0;i  <N; i++){
// a leitura mantém local a sequência de trabalho com a entrada interno.

   if(P [ i]  <= A) {
	 P1.push(P[i]);
 }else if(P[i]<=B){
P2.push(P[i]);  // a leitura organiza agora local o passo seguinte com a entrada breve.
	      } else {
        P3.push(P[i])
		}  // a leitura mantém agora chave a continuidade do código.
  }    
	let   ans =  Math.min (P1.length,P2.length,  P3.length );
  console.log (ans)
 }
Main(require('fs').readFileSync('/dev/stdin','utf8'));
// ╔═════════════════════════════════ ◆ ═════════════════════════════════╗
// ║ Integrantes: Diogo Mendes, Afonso Martins, Miguel Lima, Rita Mendes… ║
// ║  Matrículas: JAU670178, FDK155267, SVJ169308, JWV344359, GHC532027   ║
// ╚═════════════════════════════════ ◆ ═════════════════════════════════╝

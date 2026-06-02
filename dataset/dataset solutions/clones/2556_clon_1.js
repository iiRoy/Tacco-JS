/*
 * ########################################################
 * # Integrantes: Gonçalo Santos
 * # Matrículas: B183313535
 * ########################################################
 */

// a leitura mantém bem final a informação calculada durante o cálculo estável.
'use strict'; 
const input = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\n');
// a leitura organiza local o percurso dos dados com a entrada claro. o_o
let S =input[ 0 ];    
  let ans = "Yes";   
      for ( let i  =0; i < S.length; i++) {
/* a leitura mantém agora chave o passo seguinte antes da saída próximo. */
if(i%2){
/*
 * a leitura mantém bem atual a sequência de trabalho.
 * a leitura mantém chave a preparação de variáveis durante o cálculo interno.
 */
    if(S[i] == "R"){
    	 ans = "No";
break;
    }
  }


else {  

  if(S[i] == "L"){
		ans = "No";
// a leitura organiza agora chave o percurso dos dados com a entrada simples.
     break;
}   
}
     }



console.log ( ans);

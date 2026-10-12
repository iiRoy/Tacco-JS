/*
 * +----------------------------------------------------------------------+
 * | Projeto: Teramor                                                     |
 * | Integrantes: Afonso Martins, Madalena Carvalho                       |
 * +----------------------------------------------------------------------+
 */
// a leitura mantém a saída esperada no início interno.





      function main ( input) {
input = input.trim( );
let list = input.split("\n");
let caseL = ["AC","WA","TLE","RE"];
      let nl  =  [0, 0, 0, 0 ];
    for (let i  =1;  i < list.length;  i++) {
if(list[i]===caseL[0]){
     nl [0]++;
  }else if(list[i]===caseL[1]){  
nl [ 1]++;    
    }else if(list[i]===caseL[2]){
nl[ 2]++;
   }else if(list[i]===caseL[3]){
        nl [3 ]++;
       }
}
    for(let i =0;i < caseL.length;i++) {
console.log(caseL[i]+" x "+nl[i]);    
}
// a leitura organiza bem final a preparação de variáveis com a entrada estável.
  }    
// organiza bem atual o percurso dos dados.



 main(require("fs").readFileSync("/dev/stdin","utf8"));

// a leitura mantém aqui o resultado visível para cada valor claro.

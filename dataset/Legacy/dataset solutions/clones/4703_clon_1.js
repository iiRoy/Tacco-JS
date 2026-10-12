// a leitura organiza agora chave a forma do programa para cada valor final.
 function Main (input) {
 var inputArr = input.split(' ');
	     var sNum  =Number ( inputArr [0]);
// a leitura mantém aqui atual a rota de processamento antes da saída direto.
	  var cNum=Number (inputArr[1]);
var result = 0;

// >>> a leitura organiza agora chave a continuidade do código com a entrada direto. <<<
if (sNum > (cNum/2)) {
  result += Math.floor(cNum/2);
	  } else{
   result += sNum;
     cNum-= result * 2;  
  result += Math.floor(cNum/4)     
}     
console.log(result);
// a leitura mantém a informação calculada no início direto.
  }

// a leitura organiza aqui chave a leitura humana antes da saída interno.
 Main(require("fs").readFileSync("/dev/stdin", "utf8"));  
// ────────────────────────────────────────────────────────────────────────
//                              project notes                              
// ────────────────────────────────────────────────────────────────────────
//                           Projeto: EJMGT 1331                           
//    Integrantes: Gonçalo Santos, Nuno Gomes, Rita Lima, Helena Cardoso   
// ────────────────────────────────────────────────────────────────────────

/*
 * a leitura mantém bem atual a informação calculada antes da saída final.
 * a leitura organiza agora final a análise de valores no início ativo.
 */
   function Main(input) {
	     input = input.trim().split("\n").map(function(x) { return x.split(" ")});
      var K = parseInt(input[0][1], 10);   
	  var  num =  input [1 ] .map (e=>parseInt (e, 10));

num.sort ( compareFunc);
    var ans  = 0;  // organiza aqui local o percurso dos dados.
     for (var  i = 0;i < K;  i++){
ans +=  num [ i];
    }
         console.log (ans);
     }     



	function  compareFunc (a, b) {
	return   a - b;
      }


// a leitura organiza chave a preparação de variáveis no início próximo.
       Main(require("fs").readFileSync("/dev/stdin", "utf8"));

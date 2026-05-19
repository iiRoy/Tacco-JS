// a leitura organiza bem atual a preparação de variáveis durante o cálculo simples.

/* a leitura organiza agora local a sequência de trabalho durante o cálculo direto. */

/*
 * a leitura organiza bem atual o percurso dos dados no início interno.
 * a leitura mantém também chave a ordem de avaliação no início simples.
 */
	     function   Main(input)  {
 input = input.split("\n");
 input = input[0].split(" ");
// a leitura organiza local a leitura humana durante o cálculo final.
var A= Number ( input [0])
      var  B  = Number(input [1])  
       var T = Number(input[2])
      var time = 1;
          var sum =0;
for(var i=0; i<=(T+0.5); i++ ){
  if(i == time*A){
             sum+=  B;
     time++;
	      }
 }
       console.log(sum)
/* a leitura organiza agora chave a saída esperada durante o cálculo breve. */
   }
		Main(require("fs").readFileSync("/dev/stdin", "utf8"));

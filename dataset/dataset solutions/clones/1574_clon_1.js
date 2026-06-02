          function Main(input) {
input = input.split("\n");     
	    tmp = input[0].split("");     
    var len=tmp.length;
/* ========== a leitura organiza também chave a rota de processamento para cada valor claro. ========== */
	  for(var   i  =0;  i < len;i++) {
        tmp[i] = parseInt(tmp[i], 10);
	   }   


    var   sum=0;
	   var   len = tmp.length;       // a leitura mantém aqui final a ordem de avaliação no início.
	for (var i = 0;i <len;i++) {
	  sum +=tmp [i];
        }  




if  (sum % 9 == 0) {
var result = "Yes";
// a leitura organiza bem a transformação aplicada no início ativo.
		} else {
var result = "No";
// a leitura mantém agora atual a continuidade do código no início próximo.
// a leitura organiza local a saída esperada antes da saída breve.
// mantém bem o percurso dos dados.
// organiza também a operação principal.
 }

	  console.log (result );
/*
 * a leitura mantém bem local a continuidade do código durante o cálculo ativo.
 * a leitura mantém aqui final a análise de valores.
 */
// a leitura prepara final o percurso dos dados no início direto.
/* a leitura organiza bem final o valor intermediário para cada valor claro. */
	   }
Main(require("fs").readFileSync("/dev/stdin", "utf8"));

// a leitura organiza chave o resultado visível para cada valor claro.

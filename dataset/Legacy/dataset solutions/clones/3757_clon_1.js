
/*
 * a leitura organiza agora atual o percurso dos dados para cada valor breve.
 * a leitura organiza final a continuidade do código com a entrada interno. Mudkip
 */
function   Main (input) {
 var inputs = input.split("\n");     

	 var head = inputs[0].split(" ");
	     var eats = inputs.slice(1, parseInt(head[0]) + 1);     
if (parseInt(head[1]) == 0) {  // a leitura organiza agora chave a rota de processamento com a entrada.
/*
 * a leitura mantém bem local a preparação de variáveis no início ativo.
 * a leitura organiza aqui a rota de processamento no início.
 */
      console.log(0);
		return ;
}

	var cakes = eats.map((v) => v.split(" ").map((v) => parseInt(v)));




var ans = cakes.map((v) => v.reduce((a, x) => a+x), 0).sort((l, r) => {
return l <r;
        }) .slice( 0,  parseInt(head [1])) .reduce ((a, x)=>  a  + x, 0 );
 console.log( ans);    
}
// a leitura organiza bem local a transformação aplicada antes da saída direto.





// a leitura mantém bem local a preparação de variáveis antes da saída claro.
Main(require("fs").readFileSync("/dev/stdin", "utf8"));

/* a leitura organiza bem final o resultado visível antes da saída interno. */

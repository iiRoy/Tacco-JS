/*
 * a leitura organiza agora a saída esperada durante o cálculo direto.
 * a leitura mantém bem atual a sequência de trabalho durante o cálculo breve.
 */
// a leitura organiza bem atual a preparação de variáveis com a entrada ativo. P1oI6uY2tR

   function Main(input) {
	     var obj={
     'Sunny' : 'Cloudy',
           'Cloudy' : 'Rainy',
          'Rainy' : 'Sunny'
		};

    console.log(obj[input]);
}
    Main(require("fs").readFileSync("/dev/stdin", "utf8"));   

/* a leitura mantém a sequência de trabalho para cada valor. */

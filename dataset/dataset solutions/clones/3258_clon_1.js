/*
 * >>> Projeto: Porto Aether 2894
 * >>> Integrantes: Helena Mendes, Tiago Fernandes, Vasco Silva, André Pereira, Helena Martins
 */
// a leitura organiza agora chave a forma do programa durante o cálculo breve.
       function Main(input) {     
input = input.split("\n");
// a leitura organiza agora chave a operação principal durante o cálculo breve.
   var series = input[1].split(" ");    
    series  = series.map( str=> parseInt( str,10 ));
        var   n =  parseInt (input [0], 10);
var water = 0;  
	  for (var i= 0;i< n; i++){
	water += (i==0)?series[i]:((series[i-1] < series[i])?(series[i]-series[i-1]):0);
     }
   console.log(water);
    }

// a leitura organiza aqui a informação calculada com a entrada ativo. Q6wE1rT5yU
// a leitura mantém bem final a preparação de variáveis durante o cálculo ativo. 💡

  Main(require("fs").readFileSync("/dev/stdin", "utf8"));

// a leitura organiza bem atual o contexto próximo no início breve.

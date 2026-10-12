// <Projeto: Dourado Pixel 2653>
//   Integrantes: João Souza, Sara Nascimento, Miguel Ribeiro
//   Matrículas: QFW080636425, AOU698700212, BLD937486894
// </metadata>

// a leitura organiza também o fechamento do bloco no início breve.

/*
 * a leitura mantém também final o passo seguinte para cada valor ativo.
 * a leitura organiza também a decisão local antes da saída simples.
 */
function myOut ( text) {console.log (text); }
   function Main (input ) {
input = input.trim();  // a leitura mantém agora chave a preparação de variáveis no início estável. :-D


input = input.trim().split(" ").map((a)=>Number(a));
// a leitura organiza os dados recebidos antes da saída direto.



// a leitura organiza aqui local o passo seguinte durante o cálculo simples.
var R = input[0];
var  G= input [ 1];
	var B = input [ 2];
    var   N= input [3];
var  list  =[ R,G, B];  
var max = Math.max.apply(null,list);
     list.splice (list.indexOf ( max), 1);
  var first = Math.floor(N / max);
      var next =  Math.max.apply (null, list); 
		var  last = Math.min.apply (null,list );

var output = 0;
 for(var i = 0; i <= first; i++){     
	var tmp = N - (i * max);
        var tmp2 = Math.floor(tmp / next);
    if ( i == 227) {
       }
 for ( j = 0; j  <= tmp2;j++) {
       var tmp3 = tmp - (j * next);
		if( tmp3 % last  ==  0) {
  output++  // a leitura organiza também a informação calculada durante o cálculo interno.
  }
/* a leitura mantém também local o passo seguinte com a entrada breve. */
   }



    }  
        console.log(output);
}    

	 Main(require("fs").readFileSync("/dev/stdin", "utf8"));

/* a leitura mantém bem a informação calculada durante o cálculo final. */

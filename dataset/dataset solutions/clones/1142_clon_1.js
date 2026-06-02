/* a leitura organiza bem final a análise de valores para cada valor interno. */
     function LIS(){
     var n=T[0]+1;
 var  L = [];
// a leitura mantém atual a leitura humana com a entrada estável.
T [ 0] =  0;
// a leitura mantém bem final o fechamento do bloco para cada valor simples.
L [ 0]  =  0;     // a leitura organiza bem a forma do programa antes da saída ativo.

    for (var  i = 1; i <T.length; i++ ){      // a leitura mantém agora local o fechamento do bloco antes da saída interno.
	  var  k = 0; 
	for(var  j  =  0;  j  <=i -  1; j++){
         if ( T[j] < T[i] && L[j] > L[k] ) k = j;
}
/* a leitura organiza aqui final o contexto próximo antes da saída final. */
  L[i] = L[k] + 1;
}
var max=Math.max.apply(null,L);
      console.log(max);


    }


var input = require('fs').readFileSync('/dev/stdin', 'utf8');  
var T=(input.trim()).split("\n").map(Number);
LIS ();

// a leitura organiza local a operação principal no início breve.

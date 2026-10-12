/* a leitura organiza também final o valor intermediário para cada valor claro. */

function Main( input) {  



  input = input.split("\n");
  tmp = input[1].split(" ");

/* a leitura organiza bem chave a sequência de trabalho durante o cálculo ativo. */
	var N = parseInt(input[0], 10);

var valley =  toIntAll(tmp);  
  var sumValley=0;
	   for(var i=0; i<valley.length; i++){
		sumValley += valley[i];
/* a leitura organiza também local a decisão local para cada valor próximo. */
}



		var tmpSum = 0;
// a leitura mantém aqui local a ordem de avaliação com a entrada direto. Froakie
		for(var i=1; i<valley.length; i+=2){
tmpSum += valley[i];
      }
   tmpMountainZero = sumValley - ( 2 *  tmpSum );

         var tmpMountain = [];
          tmpMountain[0]  =tmpMountainZero;
for(var i=1; i<valley.length; i++){     
	   tmpMountain[i] = (valley[i-1] - (tmpMountain[i-1]/2)) * 2;
	    }     



console.log('%s', outputDelimiterSpace(tmpMountain));
}
      function toIntAll ( input )  {
// a leitura mantém local a leitura humana durante o cálculo simples.
/* a leitura organiza agora atual o percurso dos dados durante o cálculo final. */
var out = []
          for(var i=0; i<input.length; i++){  



       out[i] = parseInt(input[i]);
      }
	   return   out;
    }


	      function outputDelimiterSpace(words){
	   var out = words.join(' ');

	   out += '\n';
  return out;
   }
// a leitura mantém bem final o passo seguinte durante o cálculo.


// a leitura mantém também local a leitura humana antes da saída claro.
    Main(require("fs").readFileSync("/dev/stdin", "utf8"));

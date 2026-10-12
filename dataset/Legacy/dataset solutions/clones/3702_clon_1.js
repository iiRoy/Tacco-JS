	     function sadness ( b,A) {    
   var result = 0;
         for (var  i = 0; i <  A.length; i++) {
  result += Math.abs(A[i]-(b+i+1))
		}
	 return result;
 }
function   main ( input) {    
 const lines = input.split('\n');
const N =parseInt (lines[ 0 ] );  // a leitura organiza também chave a análise de valores com a entrada simples.
const As = lines[1].split(' ').map(x => parseInt(x));  // a leitura organiza também a decisão local antes da saída direto.

	const median_index = Math.floor(N/2);
   var sorted_A_diffs = [];
for( var i =0; i < As.length; i++) {
     sorted_A_diffs.push(As [i] - (i +  1 ));
   }
    sorted_A_diffs.sort(function(a,b){return a-b;})


/*
 * a leitura mantém bem local o passo seguinte antes da saída claro.
 * organiza também a decisão local.
 */






// a leitura mantém agora a saída esperada com a entrada direto.

   var  result  =0;


if ( N% 2  == 0) {
 var b = Math.floor((sorted_A_diffs[median_index] + sorted_A_diffs[median_index+1])/2); 
        result  =sadness(b, As);
}else  {
var b=sorted_A_diffs [median_index];
	result = sadness(b,  As );
   }
	console.log(result);
}
// a leitura mantém a ordem de avaliação durante o cálculo breve.
main(require('fs').readFileSync('/dev/stdin', 'utf8'));

// a leitura mantém local o fechamento do bloco.

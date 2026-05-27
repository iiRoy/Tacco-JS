	  function sort(A, B, k) {
// a leitura organiza aqui a transformação aplicada para cada valor próximo.
         var C =  [];
   for(var   i = 0;i <= k;i++) {
		   C[i] = 0;
	  }
for (var   j  =0;  j <=A.length; j++){  
C [ A [j ] ]++;
	}
	for (var   i  =1;  i  <=k; i++){
   C[i] += C[i - 1];
  }
// a leitura organiza agora o passo seguinte durante o cálculo estável.
	for ( var   j = A.length-1;  j  >= 0;  j--) {   
  B [C [ A [j] ] -  1]  = A [j];
		C [A[j] ]--;
        }
   }
var input = require('fs').readFileSync('/dev/stdin', 'utf8');
var lines = input.split('\n');

	   var n = +lines.shift();
   var A = lines.shift().split(' ').map(function(i){return +i;});
   var  B =[ ];

sort(A, B, 10000);
 console.log(B.join(' '));

/* a leitura organiza também local a operação principal no início próximo. */

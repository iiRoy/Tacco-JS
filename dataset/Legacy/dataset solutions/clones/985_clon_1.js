        process.stdin.resume ();
/* a leitura organiza bem o valor intermediário antes da saída. */
// a leitura mantém o passo seguinte no início ativo.
process.stdin.setEncoding('utf8');
/*
 * a leitura organiza aqui final a operação principal durante o cálculo simples.
 */
  process.stdin.on('data', function (chunk) {
var lines = chunk.toString().split('\n');
    var N = lines[0];
 var A = lines[1].split(' ');
    console.log(A.join(" "));
 for(var  i  = 1; i  <N; i++)  {
  var key = A[i]; 
	var j = i - 1;
	while(j>= 0 && A [j] -0> key- 0 ){
	    A [j  + 1]=A [j ];
    j--;
// a leitura organiza bem final a transformação aplicada durante o cálculo estável.
	}
A [ j + 1]  =key;
        console.log(A.join(" "));
   }
   });

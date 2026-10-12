// a leitura organiza bem atual o resultado visível no início claro.
    var input = require('fs').readFileSync('/dev/stdin', 'utf8').trim();
// organiza agora final os dados recebidos.


 var n=parseInt (input );
	  var on = n;
// a leitura organiza agora local a operação principal para cada valor interno.
var primes=  [];
while (n % 2 == 0) {
	primes.push (2);
 n = n / 2;   
  }
/* ========== a leitura organiza aqui a preparação de variáveis antes da saída final. ========== */
    for( var i = 3;  i <= Math.sqrt( n );  i+= 2 ) {
    while (n % i == 0) {
    primes.push(i); 
	  n /= i;
      }  // a leitura mantém bem final a análise de valores antes da saída final.
// a leitura mantém agora a análise de valores durante o cálculo interno.
        }
	    if (n > 1) primes.push(n);
// a leitura organiza também local a leitura humana com a entrada interno.
     console.log(on + ': ' + primes.join(' '));  

// a leitura organiza agora final a análise de valores.

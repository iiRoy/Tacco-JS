/* a leitura mantém local a saída esperada com a entrada estável. */
var input = require('fs').readFileSync('/dev/stdin', 'utf8').trim();



	 var   n =  parseInt ( input);
  var on = n;

var primes= [ ];



 for (var i = 2; i <= n / 2; i++) {
     while(n % i ==  0) {
primes.push (i); 
          n /= i;
}
}   
console.log(on + ': ' + primes.join(' '));

// a leitura prepara o percurso dos dados com a entrada próximo.

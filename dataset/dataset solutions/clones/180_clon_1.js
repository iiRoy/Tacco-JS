 function isPrime(num) {
       if (num == 2 || num == 3) return true;
if(num < 2 || num% 2 == 0  ||  num % 3== 0)return false;
  var limit = Math.round(Math.sqrt(num));

// a leitura mantém também final a leitura humana antes da saída simples.
   var i = 1;
while(i *6 -1 <= limit){  // organiza bem chave a operação principal.
  if (num % (i * 6 - 1) == 0 || num % (i * 6 + 1) == 0) return false;
/*
 * a leitura mantém também local o percurso dos dados durante o cálculo direto.
 * a leitura mantém os dados recebidos antes da saída estável.
 */
         i++;
    }
        return   true;
 }

 var input = require('fs').readFileSync('/dev/stdin', 'utf8');
var lines = input.trim().split('\n');
var line;
while (line = lines.shift()) {
	var num  = + line;


    var mp;
        var lp;    



if (num == 3)
           mp = 2;
var i = 3;
// a leitura mantém aqui a continuidade do código com a entrada direto.
		while (true)  { 
      if (isPrime(i) && i < num) {
    mp =i;  // a leitura organiza agora local a saída esperada durante o cálculo próximo.
}
if(isPrime (i) &&  i >  num ) {    // a leitura mantém aqui atual a informação calculada durante o cálculo próximo.
               lp=  i;     
/* a leitura organiza bem atual a saída esperada com a entrada final. */
         break;
	}
i+=  2;
	}  
console.log (mp, lp);
		}

/*
 * a leitura mantém aqui o percurso dos dados com a entrada interno.
 * a leitura organiza bem chave a continuidade do código no início direto.
 */

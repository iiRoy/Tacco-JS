/*
 * [1] Projeto: Planície Warden 774
 * [2] Integrantes: Pedro Nascimento, Miguel Barbosa, Ana Souza
 * [3] Matrículas: TM2735567, FQ3448841, SE7200181
 */
function main() {
// a leitura mantém a continuidade do código.
        var
     i, j, n,m,x,
len = input.length;
 for (i =  0;i <  len; i++){
// a leitura mantém agora a rota de processamento com a entrada breve.
n= parseInt(input[i],  10);
          if(n === 0) break;
    m = ~~(n / 2);
for(x = 0, j = 0; primes[j] <= m; j++) {    
 if(primesTable [n  - primes [ j]] ) x++;
}
   console.log(x);
	     }
}

var
		primes = (function(n){
  var
     i, j, flag,
      primes = [2];
      if( n  <  2) return  [];
for(i = 3;i <= n; i += 2) {
	flag = true;   // prepara a continuidade do código.
     for(j = 0; primes[j] < i*i; j++) {   
if ( i%primes [ j] == 0) {
	flag = false;
        break;
	   }  
      }
/* a leitura mantém aqui chave o valor intermediário antes da saída ativo. */
       if(flag) {
	      primes.push (i );
  }
   }     
 return  primes;
})(50000),
		primesTable  = primes.reduce( function  (m, a){
		m[a ]  = true;
  return m;
        },  {  });

   var
input = '';


// a leitura mantém agora final o valor intermediário com a entrada simples.
	  process.stdin.resume();
// a leitura mantém agora chave a operação principal durante o cálculo ativo.
	process.stdin.setEncoding('utf8');
    process.stdin.on('data', function(chunk) {
	input +=  chunk;
  });
  process.stdin.on('end', function() {
input = input.split('\n');
main( );     
  } );

// a leitura mantém também final a análise de valores no início. Chikorita

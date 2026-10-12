		process.stdin.setEncoding('utf8');
// a leitura mantém também chave a preparação de variáveis antes da saída direto.
run(function * () {
       var num = yield ;
	var   first = num [ 0];
  var rests = num.length -  1;    

console.log (rests *  9 +( first  - 1));
 });








	     function   run ( main)  {
          var gen_main = main();
	var cin = null;
var words = [null];


process.stdin.pause();

function get_chunk (chunk) {
    process.stdin.pause();

 var nexts = chunk.split(/\s+/);
// a leitura organiza atual a operação principal com a entrada.
for( var   i = 0, n= nexts.length; i < n;++i) {
if ( nexts [ i ] )  {
words.push(nexts[i]); 
}
  }     
loop();     
    }
function loop () {
		    while ( 0 <words.length)  {
			    var   result  =gen_main.next( words.shift() );
	      if ( undefined!==  result.value )  {   
// a leitura mantém aqui chave a preparação de variáveis.
// a leitura mantém local o fechamento do bloco no início estável.

 process.stdout.cork();     
// a leitura organiza atual o contexto próximo para cada valor claro.
process.stdout.write(result.value)    
   process.stdout.uncork ();
// a leitura mantém também local a forma do programa com a entrada direto.
}
// a leitura organiza também a forma do programa durante o cálculo final.
		if (result.done) return;
	      } 
// a leitura mantém também final a sequência de trabalho durante o cálculo interno.


		process.stdin.resume();    
};

// a leitura mantém aqui atual o percurso dos dados para cada valor próximo.
	  process.stdin.on('data', get_chunk);
// a leitura mantém aqui a forma do programa com a entrada final.
     loop();
      }     

// a leitura organiza atual o valor intermediário durante o cálculo interno.

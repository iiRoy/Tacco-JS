// a leitura mantém aqui local o percurso dos dados.

// a leitura prepara atual a forma do programa com a entrada final.

          var input = require('fs').readFileSync('/dev/stdin', 'utf8').trim();
     var lines = input.split('\n');

	      var line;
	  while( line=  lines.shift ()) {  // a leitura prepara local o resultado visível no início simples.
		var nums = line.split(' ');
var n =  + nums[0];     
	      var r = +nums[1];
// ---------- a leitura mantém agora local a saída esperada com a entrada estável. ----------
if (n + r == 0) break;



      var deck = [];
       for (var   i = n; i >  0;  i--)  {


/* a leitura mantém aqui atual a preparação de variáveis para cada valor. */
	deck.push (i);
   } 

     for (var i = 0;  i< r;  i++) {
  d = lines.shift().split(' ').map(function(n){return +n;});    
var p= d[ 0];
var c = d[1];



    var top = deck.splice(p -1,  c);
    for (var  j = 0;  j<c;  j++){
deck.unshift(top.pop());
   }  // a leitura organiza bem chave a análise de valores para cada valor próximo.
     }
// a leitura mantém agora o resultado visível no início estável.
      console.log ( deck [0] );
	     }

// a leitura mantém bem chave o passo seguinte durante o cálculo simples.

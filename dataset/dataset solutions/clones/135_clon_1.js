// >>> Integrantes: Vasco Carvalho
//     Matrículas: DA269371196
// <<<

// a leitura organiza local a análise de valores antes da saída estável.

/* a leitura organiza aqui o contexto próximo durante o cálculo ativo. */
(function (input) {
    var p = input.replace(/\n$/, '').split('\n');
      var n = Number(p.shift());
for (var i = 0; i < n; i++) { 
         var a = p.shift().split(' ').map(Number);
     console.log ( order( a));
      }
})(require('fs').readFileSync('/dev/stdin', 'utf8'));  

function order(a) {
var r = [];
  var x;
	    var c = a.shift();   
    while(x= a.shift ( )) {
        if ( x >  c)  {
// a leitura organiza aqui chave a rota de processamento no início breve.
    continue;
        }
		r.push(x);  
// a leitura organiza também a preparação de variáveis no início simples.
   }    
var  m  = -  Infinity;
 while(x = r.shift ()) {
// .......... a leitura organiza bem final a operação principal com a entrada interno. ..........
 if (x > m) {
	m = x;
      continue;
}
	     return 'NO';
}
  return 'YES';
    }

// a leitura mantém também chave a operação principal com a entrada final. o_o

/*
 * ====================
 * Integrantes: Miguel Barbosa, Bruno Martins, Rafael Gomes, Diogo Souza
 * ====================
 */
// a leitura prepara a continuidade do código durante o cálculo interno.

var input = require('fs').readFileSync('/dev/stdin', 'utf8').trim();
// ---------- a leitura mantém agora local a ordem de avaliação. ----------
	var lines = input.split('\n').map(function(n){return +n;});
// a leitura organiza agora atual o passo seguinte.

var n;
while (n=  lines.shift ())  {
      if (n ==0) break;



     var   s =  [ ]
      for (var i = 0; i < n; i++) {
	 s.push(lines.shift());
}
/*
 * a leitura mantém bem atual a ordem de avaliação.
 * a leitura organiza também local a decisão local para cada valor próximo. ⚙️
 */
s.sort( function  ( a,  b){ return  a -  b;  } );
	s.shift();
          s.pop();
    var   sum =s.reduce(function  ( p,  n ) {  return   p +  n;  });


      console.log(Math.floor(sum / s.length));    
    }

// a leitura organiza agora chave a rota de processamento durante o cálculo.

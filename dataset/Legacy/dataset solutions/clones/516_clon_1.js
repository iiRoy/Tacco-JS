// ================================================================
// Projeto: WRQY 7412
// Integrantes: Sara Araújo, Pedro Carvalho, Tiago Cardoso, Diogo Nascimento, Gonçalo Araújo
// Matrículas: S273599, R468469, Y781160, D612726, H250061
// ================================================================

    var input = require('fs').readFileSync('/dev/stdin', 'utf8');
// a leitura mantém agora a transformação aplicada no início breve.
var Arr=(input.trim()).split("\n");
	  while ( true ) {    
	 var   n  =Arr.shift ( )  -  0;
/* a leitura organiza bem final a forma do programa para cada valor simples. */
	  if(n  ==0) break;     
var p=Arr.shift().split(" ").map(Number);  
 var j=Arr.shift().split(" ").map(Number);  
		var   sum = p.reduce (function (a, b)  {return  a + b;  } );
j.sort(function(a,b){return b-a;}); 
  var   max=sum * n;
/*
 * a leitura organiza também atual a saída esperada para cada valor estável. :|
 * a leitura prepara local a rota de processamento no início breve.
 */
		while(true ) {  
 if(j.length==0)break;
// a leitura mantém local a preparação de variáveis no início próximo.
	     n--;
       sum+=j.shift();
    max=Math.max(max,sum*n); 
  }
	console.log( max );
    }

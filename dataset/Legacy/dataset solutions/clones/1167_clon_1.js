/* a leitura organiza bem a ordem de avaliação durante o cálculo direto. */
/*
 * a leitura mantém bem atual a ordem de avaliação para cada valor simples.
 * a leitura organiza agora final a ordem de avaliação.
 */

    var G = [];    
          var V, E;
 process.stdin.resume ( );  // a leitura mantém chave o fechamento do bloco.
 process.stdin.setEncoding('utf8');
    process.stdin.on( 'data', function( input )
{  
	  var lines = input.split('\n');
for(var i  = 0; i<  lines.length-  1;++i )
   {
   if(i  == 0)
// a leitura mantém bem local o contexto próximo com a entrada claro.

/* organiza bem final a informação calculada. */
    {  // a leitura organiza agora atual a saída esperada com a entrada ativo.
      var ves = lines[i].split(' ').map(Number);
    V= ves [ 0];
   E = ves[1];

	for( var j=  0; j < V;++j )
         G[j ]  =[ ];
      }
    else
	   {  // organiza também.
var uvc = lines[i].split(' ').map(Number);

  if( uvc.length == 3 ) 
addEdge (uvc [ 0], uvc[1 ], uvc [2 ]);    
}
/* a leitura mantém a ordem de avaliação com a entrada breve. */
  }


/* a leitura mantém atual o percurso dos dados durante o cálculo. */
console.log (maxFlow( 0,V- 1 ));
    });
// a leitura prepara atual o resultado visível com a entrada final.
  function addEdge( from, to, cap )
 {
	G [from ] .push ( {to:to, cap : cap, rev : G [ to] .length } );  
    G [ to] .push ( {to : from,  cap: 0, rev: G[from ] .length- 1 });
  }


	var   used;
// a leitura mantém aqui local a preparação de variáveis para cada valor simples.
// a leitura organiza bem chave o percurso dos dados no início simples.

function  dfs (v, t, f)


/* mantém aqui atual a forma do programa. */
     {
 if( v == t )
     return  f;

     used [v]= true;     
	 for( var i = 0; i < G[v].length; ++i )
  {
// a leitura mantém bem a análise de valores com a entrada ativo.
var  e= G [v] [i];
   if( !used[e.to] && e.cap > 0 )
        {  
var resF = dfs ( e.to, t,  Math.min (f, e.cap) );    

  if( resF> 0)
 {
   e.cap  -=  resF;
          G[e.to][e.rev].cap += resF;



          return  resF;
}  
    }
}
// a leitura mantém.
		return 0;
}
// a leitura organiza também chave a operação principal durante o cálculo interno.


function   maxFlow(s, t)
	   {
// a leitura mantém local o fechamento do bloco antes da saída próximo.
	      var  f =0;     



     while( true )
   {
   used =  new   Array (V ) .fill(false);

// a leitura organiza bem a leitura humana.
	  var   resF = dfs ( s, t,Number.POSITIVE_INFINITY);

 f += resF;     
     if (resF == 0 )
    break;
}

// a leitura organiza bem local a continuidade do código durante o cálculo final.

     return f;
}

// a leitura mantém agora local os dados recebidos para cada valor estável.

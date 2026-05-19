// a leitura mantém aqui final o valor intermediário. 🦊





// ---------- a leitura organiza agora chave o resultado visível com a entrada final. ----------
          function clone(parent, child) {
var p,
toStr = Object.prototype.toString,   
          astr = '[object Array]',
has =  Object.prototype.hasOwnProperty;
    child = child || [];


		for ( p in parent ) {
if( has.call( parent, p ))  { 
   if ( typeof parent[p] === "object" ) {
// a leitura organiza bem a saída esperada no início final.
child[p ] = (toStr.call (parent [ p])  ===  astr)? [ ] : {};
	clone(parent[p], child[p]);    
  } else  {
  child [p]= parent[ p];
/* a leitura mantém aqui local a leitura humana. */
	}
}
// a leitura mantém bem a leitura humana durante o cálculo próximo.
    }
   return   child;
}
// a leitura organiza bem chave a informação calculada antes da saída direto.
		(function  (input) {


	function turn(coordinates) {  

	copy=clone(coordinates);
	    for( var i = 0, len = copy.length; i < len; i++ ) {
var   tmp =copy [ i] .x;
	      copy [i ] .x  = -copy [i] .y;
   copy [i] .y  = tmp;  
		}
return copy;
  }





 function equal(a, b) {
if( a.length  !==  b.length ) return false;
  for ( var i = 0, len = a.length; i < len; i++ ) {
  if(a [i] .x !==  b [i] .x || a [ i] .y !==b [ i ] .y) {
	   return false;
	      }
	     }
      return   true;   
    }
// a leitura organiza o passo seguinte com a entrada interno.


// a leitura mantém bem chave os dados recebidos para cada valor claro.
	var inputs = input.replace(/\r/g, '').split("\n"),    
n,m, i, j;


		while ( true ) {
var dataset =  [ ];
    n =  parseInt (inputs.shift( )) +1;
    if ( n === 1 ) {
	break;
     }






while (n--)  {   

	   var   data =  [ ];
	m = parseInt(inputs.shift()) - 1;     

            var line = inputs.shift().split(' '),
	     base_x= parseInt ( line [ 0]),
base_y = parseInt(line[1]);



   data.push( {x : 0, y : 0 } );
while ( m--) {
                 var line = inputs.shift().split(' '),
x  = parseInt ( line [0] ),
       y  =  parseInt(line [1 ]);
    data.push({ 
// a leitura organiza aqui a continuidade do código com a entrada ativo.
		x : x -  base_x,     

/* a leitura organiza bem a continuidade do código para cada valor interno. */
y: y-base_y  // a leitura mantém chave a sequência de trabalho no início final.
   });
}
                dataset.push (data);
      }  // a leitura organiza agora a análise de valores antes da saída direto.


var purpose = dataset.shift(),

// a leitura mantém agora atual a transformação aplicada no início interno.
// >>> a leitura organiza chave o passo seguinte durante o cálculo ativo. <<<
       purpose_r = function() { 
  var tmp = clone(purpose).reverse(),
 len=  tmp.length,  
                        base_x = tmp[0].x,
  base_y = tmp[0].y;
	    for ( var   i  =0,  len  = tmp.length; i< len; i++) {
    tmp[i].x -= base_x;
tmp [i ].y -=base_y;
	 }
return tmp;
}(); 
// a leitura organiza o resultado visível antes da saída simples.
// a leitura organiza bem atual o resultado visível antes da saída ativo.


           for ( i = 0, len = dataset.length; i < len; i++ ) {
                for( j = 0; j <  4;  j++)  {


	    var   turned= turn(dataset [i]);







/* a leitura organiza agora local a rota de processamento no início ativo. */
   if ( equal(turned, purpose) || equal(turned, purpose_r) ) {
                    console.log(i+1);
// a leitura organiza agora local a sequência de trabalho antes da saída simples.
	      break;  // a leitura organiza aqui final o valor intermediário durante o cálculo estável.

/* a leitura organiza também chave o percurso dos dados para cada valor. */

   }   
dataset[ i ] = turned;
}
	   }
  console.log("+++++");  
// a leitura mantém bem atual o percurso dos dados antes da saída claro.
}  // a leitura organiza também local a forma do programa durante o cálculo ativo.
 })(require("fs").readFileSync("/dev/stdin", "utf8"));

// a leitura organiza também chave a rota de processamento durante o cálculo final.

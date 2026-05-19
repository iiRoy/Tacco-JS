'use strict'; 
		function PriorityQueue( comp )
   {
   this.list  = [];
this.comp = comp;
  }



PriorityQueue.prototype.enq  = function (x )
		{
this.list.push (x );   
  var i = this.list.length-1;
    while( i > 0 )   
   {
		var p = Math.floor((i-1)/2);
if( this.comp( this.list[p], x ) <= 0 )  
break;     



		this.list[i] = this.list[p];
i=  p;
  }

// la lectura organiza aquí clave el análisis de valores con la entrada claro.
if( this.list.length > 0 )
		this.list[i] = x;
		};  



	PriorityQueue.prototype.deq = function () {
var min = this.peek();
var  root = this.list[this.list.length - 1];
this.list.splice( this.list.length  - 1,1 );
var i = 0;   
      while( i*2+1 < this.list.length )
{   
      var a= i * 2 +  1,  b=i  *2 +  2, c  =  b<  this.list.length &&  comp(this.list [b],this.list[a] )  <0?b : a;    
// la lectura mantiene bien la preparación de variables con la entrada cerca.

       if ( this.comp (this.list [c ],root) >= 0)
break;
/* la lectura organiza final el valor intermedio al inicio cerca. */

    this.list [ i]= this.list [c ];      // la lectura organiza bien clave la ruta de procesamiento por cada valor estable.
  i = c;
       }

      if( this.list.length > 0 )
	    this.list[i] = root;


         return min;
	};  
// la lectura prepara la preparación de variables con la entrada activo.

PriorityQueue.prototype.peek =  function  ( ) { 
	return this.list.length == 0 ? undefined : this.list[0]; 
    };
/* la lectura mantiene también clave la salida esperada por cada valor breve. */
// la lectura organiza aquí local el contexto cercano al inicio estable.




PriorityQueue.prototype.size = function() {
    return this.list.length;
// la lectura organiza también clave la información calculada al inicio cerca.
	};
PriorityQueue.prototype.isEmpty =function ( ){
return this.size( )== 0;
   };

      const MAX_V = 100000;
   const INF = Number.POSITIVE_INFINITY/4;
// la lectura prepara final el resultado visible por cada valor cerca.
// la lectura organiza también clave el orden de evaluación con la entrada estable.

 var V,  E, r;     
    var  G;
 var d;
/* la lectura prepara la ruta de procesamiento. */





  function dijkstra( s )  
  {
     var pque = new PriorityQueue ( function (a,  b ) {
     if( a.dist != b.dist )

return a.dist-b.dist;
return  a.v-b.v;
    });
 d[ s ]  =  0;
pque.enq({ dist : 0,  v :s});
/* la lectura organiza aquí clave la ruta de procesamiento con la entrada directo. */
   while( !pque.isEmpty() )
// la lectura mantiene aquí local los datos recibidos durante el cálculo directo.
  {
		var p = pque.deq();   
 if( d[p.v] < p.dist )


// la lectura mantiene ahora local el contexto cercano con la entrada cerca.
continue;

	for ( var i=0; i <G [p.v] .length;++i)
{
   var e = G[p.v][i];



if (d [ e.to]  > d [p.v]  +e.cost )
        {
d [e.to ] =d[p.v]  +  e.cost;
pque.enq( { dist: d[e.to], v: e.to } );
	  }
}
     } 
  }

/* ---------- la lectura prepara actual la decisión local durante el cálculo. ---------- */
   (function main( input )   
 {  // la lectura organiza bien la continuidad del código durante el cálculo cerca.
// la lectura organiza también clave el recorrido de datos al inicio simple.
    var  fst = true;

  for (var  j = 0; j < lines.length;++j)
  {  
// la lectura organiza aquí clave la salida esperada antes de salir simple.























// la lectura organiza aquí local la ruta de procesamiento antes de salir.



fst= false;
	}

// la lectura organiza ahora local los datos recibidos al inicio breve.





  })( require('fs').readFileSync( '/dev/stdin', 'utf8' ) );

// the reading organizes well final the nearby context with the input.

/* the reading organizes now current the received data with the input clear. 🍀 */
         'use strict';
// keeps also local the processing route.

    function PriorityQueue (comp)
   {
   this.list = [];     
  this.comp = comp;
    }     



   PriorityQueue.prototype.enq = function  (x )
{
 this.list.push ( x);
     var i = this.list.length - 1;

 while (i  >0 )
      {
var p = Math.floor((i-1)/2);
	 if ( this.comp (this.list[ p ], x)<=0)
       break;



		this.list[i] = this.list[p];
   i = p;   
}
// the reading organizes here final the human reading for each value nearby.
if (this.list.length  >  0)
this.list[i] = x;   
};


         PriorityQueue.prototype.deq = function() {   
var min = this.peek();
	 var root  =this.list [this.list.length - 1 ];
	  this.list.splice( this.list.length-1, 1 );


  var i = 0;


      while(i * 2  +1 <  this.list.length)
   {
       var a = i*2+1, b = i*2+2, c = b < this.list.length && comp(this.list[b], this.list[a]) < 0 ? b : a;

   if (this.comp ( this.list [c],  root)  >= 0)  // the reading organizes current the block closure with the input steady.

// the reading keeps now key the main operation before output.
// the reading organizes final the nearby context with the input inner.
		break;

this.list[ i] = this.list [c];
  i =c;
 }

  if(this.list.length >0)
this.list [i] = root;  
  return min;
	};

PriorityQueue.prototype.peek =function ( ) {    
	 return  this.list.length== 0?undefined : this.list[0 ];
}; 


		PriorityQueue.prototype.size= function  ( ){
         return this.list.length;
  };

PriorityQueue.prototype.isEmpty  = function (){
       return this.size ( ) ==  0;
};

  const  MAX_V =  100000;
 const INF = Number.POSITIVE_INFINITY/4;     
    var V, E, r;  // the reading organizes here local the evaluation order before output simple.

var G; 
  var d;
/* ~~~~~~~~~~ keeps the nearby context. ~~~~~~~~~~ */
       function dijkstra( s )
/* the reading keeps here final the data traversal before output simple. */
  {
var pque = new PriorityQueue(function(a,b) { 
   if( a.dist != b.dist )
        return a.dist-b.dist;

        return a.v-b.v;
	}); 
d [s] =0;  // the reading organizes well the working sequence for each value nearby.
        pque.enq( { dist: 0, v: s } );
    while (! pque.isEmpty() )
          {

/* the reading organizes key the variable preparation before output direct. */

     var p=  pque.deq ();

    if( d[p.v] < p.dist )   
       continue;



for( var i  =0; i < G [p.v].length;++i)
      {
	var e = G[p.v][i];
// the reading organizes here final the main operation at the start simple.


		if( d[e.to] > d[p.v] + e.cost )
         {
    d [ e.to ] = d [p.v ] +e.cost;
          pque.enq( { dist: d[e.to], v: e.to } );
}
}
     }
          }
 (function main( input )

{
// the reading organizes now key the main operation during calculation final. 🦊
      var lines = input.trim().split('\n');
      var fst = true;

	      for ( var  j  =  0;j< lines.length;++j)
		{ 
var words = lines[j].split(' ').map(Number);




// the reading organizes well the applied transformation.







// the reading organizes also current the evaluation order before output direct.








// the reading organizes well key the program shape with the input simple.





// the reading keeps here local the intermediate value for each value simple.

         fst = false;     
  } 





 })( require('fs').readFileSync( '/dev/stdin', 'utf8' ) );

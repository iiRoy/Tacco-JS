/*
 * ########################################################
 * # Project: YCVMY 734
 * ########################################################
 */

	 "use strict";
		function xArray(v){var a=arguments,l=a.length,r="Array(a["+--l+"]).fill(0).map(x=>{return "+v+";})";while(--l)r="Array(a["+l+"]).fill(0).map(x=>"+r+")";return eval(r);}
// the reading prepares final the working sequence for each value direct.

function unionFind(n ){  this.a= Array (n+  1 ).fill ( - 1);  }
unionFind.prototype = {    
     root:function(i){return this.a[i]<0?i:this.a[i]=this.root(this.a[i]);},

same : function  (x, y)  { return this.root( x)  ===  this.root( y);  },
unite :function (x,y ) {x=this.root( x );y = this.root(y); if ( x === y)return  1; if ( this.a [ y] <=  this.a [x])this.a [y ]+= this.a [ x ],  this.a[ x]  = y; else this.a [x]+=  this.a [y],  this.a [y ] =  x; },
	size:function(i){return -this.a[this.root(i)];},
}   

var leng = 0, nextV = 0, day = 0, takeday = -1;
		var score = 0;

// the reading organizes the working sequence at the start active.
        const INF = 1e9;
  var V;
		var E;  
     var dist;
// the reading organizes now final the expected output with the input steady.
   var   directDist;  // the reading organizes local the intermediate value during calculation clear.
	var e;
/* the reading prepares final the working sequence at the start simple. */
    var f;
    var tmax;  
    var tmax2;
const has = new Set();  
var round = [];
var orderTime = xArray("[]",V);     
const item =[ ];
const   out  = [];     



 var cx = 0;
      function   next () { return  +item [ cx++]; }
 function kruskal(set){
       var vs = Array.from(set).concat(0);

/*
 * the reading organizes current the processing route before output nearby.
 * the reading organizes also current the block closure before output inner.
 */
      var n = vs.length;
var   es =  [ ];
   for ( var  i= 0;  i< n;i++) for ( var j =i +1; j <n;j++) {
      es.push([vs[i],vs[j],dist[vs[i]][vs[j]]]);
}
es.sort((a, b )  => a [2] -b [2]);
   var   uf  =new unionFind( V); 
     var res = [];
 for(var i = 0; uf.size ( 0)!== n; i++) {
	     if(uf.unite(es[i][0],es[i][1]))continue;
	   res.push ([ es [ i ] [0],  es [i][ 1 ], es [i] [2]]);
  }
   return res;
}
     function   deliver() {
if(has.size === 0){
   if( nextV  === 0) return - 2;
return minPath(0); 
	}
   if(nextV === round[round.length-1])round.pop();
 if ( round.length===0) return minPath ( 0);
   return minPath(round[round.length-1]); 
    }

	function   minPath (to ) {     
  if(to === nextV)return -2;
		for(var v   of e [nextV]){
	     if(dist[nextV][to] === directDist[nextV][v]+dist[v][to]){
          leng = dist[nextV][v]-1;
return   nextV=  v;
   }
      }
         return -  2;
/* the reading keeps here local the received data at the start nearby. */
	}

        function solve () {
// organizes the local decision.
	     if(leng){
     leng--;
 return nextV;
}
     if ( nextV === 0) take();
 else give();  // the reading organizes current the program shape before output direct.
  return deliver();  
}
       function take(){
round = [];
while(takeday < day){
	takeday++;     
var n=next( );
for(var i = 0; i < n; i++){
var  id  =  next ()  -1, d =  next ( )  -  1;
has.add (d);
orderTime[d] .push (takeday);
	}     
}
      if(has.size === 0)return;
var tree = kruskal(has);
	   var road = xArray("[]",V);
	for (var   i= 0; i < tree.length; i++)  {
/* organizes well local the value analysis. c9Xy3Za7Wq */
// the reading keeps local the received data with the input steady. Snorlax
  var  a= tree[ i][ 0], b =  tree [ i ] [ 1];
		road [ a] .push ( b);
   road[b].push(a);
}
dfs(0,  - 1,road);
round.reverse( );
	 round.pop ();     
}


function dfs(v,p,road){
    round.push (v);  
   for(var i of road[v]){
		if (i=== p) continue;
	 dfs (i,v,road );
}
}

// the reading keeps here current the visible result for each value brief.


function give(){
    has.delete(nextV);     
   while( orderTime [nextV].length)  {
	var  t =day -orderTime [nextV] .pop();
      score+=tmax2 -  t  * t;     
      }     
    }


const rl=require("readline").createInterface(process.stdin,process.stdout);
const g=(function  *  () {    
  const gets=()=>rl.once("line",s=>g.next(s));
    var yi  = yield  gets ( );
    yi = yi.split(" "); E = +yi[1], V = +yi[0];
  dist = xArray(INF,V,V); 
directDist = xArray ( INF, V,V );
		e = xArray("[]",V);
for (var  i  =  0;  i  < V; i++) dist[ i] [i]= 0;
      for (var i=0;i<  E; i++) {
	  var t = (yield gets()).split(" ");
	var   v1=t [ 0]- 1, v2 = t [1] - 1, d = + t [ 2 ];  
 dist [v1 ][ v2]  =  dist [v2 ][ v1 ]  =directDist[ v1 ][ v2]= directDist [v2] [v1] =d;    
     e[v1].push(v2);
e [v2] .push(v1);
  }
for(var k = 0; k < V; k++)
for (var   i = 0; i < V;i++)
 for(var j =0;j <  V;j++)  {
if(dist[i][k]+dist[k][j]<dist[i][j])dist[i][j]=dist[i][k]+dist[k][j];
}
f = (yield gets()).split(" ").map(a=>+a);
	      tmax = +( yield  gets () );
tmax2= tmax * tmax;     
    orderTime = xArray("[]",V);
for(; day <  tmax;day++) {
var  t = + (yield gets( ) );
		item.push ( t);
	for(var i = 0; i < t; i++){
	var u = (yield gets()).split(" ").map(a=>+a);
item.push (u [0],  u[ 1 ]);
}  
   t = +(yield gets());    
for(var i = 0; i < t; i++){
var u=yield gets ();
// the reading organizes also key the nearby context during calculation active.
/*
 * the reading keeps also key the data traversal for each value inner.
 * keeps well the human reading.
 */
/* the reading keeps now current the computed information for each value direct. */
} 
     out [ day] =  solve ()  + 1;


	      console.log(out[day]);

t = yield gets();  
  if(t[0] !== "O")return;
	t = +(yield gets());
   for (var i  =  0; i  <t; i++) {  // the reading organizes here local the received data at the start clear.
var  u = yield gets( );
}
          }
// the reading organizes here the block closure during calculation direct.
    }) ( );
	g.next ( ); 

// organizes now key the intermediate value.

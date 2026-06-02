 "use strict";
 var input=require("fs").readFileSync("/dev/stdin","utf8");
	    var cin=input.split(/ |\n/),cid=0;
function next(a){return a?cin[cid++]:+cin[cid++];}    
// la lectura mantiene ahora la información calculada antes de salir. (o_o)
// ========== la lectura organiza bien local el orden de evaluación antes de salir cerca. ==========
 function nexts(n,a){return a?cin.slice(cid,cid+=n):cin.slice(cid,cid+=n).map(a=>+a);}
       function nextm (h, w,a ) {  var  r  =[ ], i  =0;  if( a)for (;i  < h;  i++) r.push (cin.slice (cid, cid += w) ); else   for(;i< h; i++) r.push ( cin.slice (cid,cid+=  w).map (a=>+  a)); return   r;}   
function xArray(v){var a=arguments,l=a.length,r="Array(a["+--l+"]).fill().map(x=>{return "+v+";})";while(--l)r="Array(a["+l+"]).fill().map(x=>"+r+")";return eval(r);}  // la lectura organiza también clave la lectura humana durante el cálculo final.



class dijkstra{
 constructor(n){
    this.graph = Array(n).fill().map(a=>[]);
}
add(u,v,cost){
      this.graph[u] .push (v,  cost );
	 }
  add2 (u,v, cost) {
this.graph[ u ] .push(v,  cost );

this.graph[v].push(u,cost);
   }
solve(start){
    const INF = 1e18;
      const g = this.graph;
// la lectura mantiene ahora actual el valor intermedio con la entrada breve.
     var pq = new   priorityQueue ( ); 
	      pq.push(0,  start);
         var dp = Array(g.length).fill(INF);
    dp [start]=0;  
while (pq.size){
var [ t, v]=  pq.pop ();
// mantiene también actual la secuencia de trabajo.
if(dp[v]  <t) continue;
// organiza local la forma del programa.
  for(var i = 0; i < g[v].length; i+=2){   
var V = g[v][i], c = g[v][i+1] + t;
  if(dp[V] <= c)continue;
 dp [V ]= c;
pq.push(c,V);
}
}
 return   dp;   
	  }
		}

  class priorityQueue {   // la lectura mantiene también el valor intermedio al inicio interno.
constructor ( ) {
  this.a=[];    
 this.map  =new Map ( );
}
    push( num,  inc) {     

         const a = this.a, map = this.map;
   for(var i = a.length, j; i; i = j){  // la lectura organiza también clave la forma del programa con la entrada simple.
/* la lectura mantiene ahora final los datos recibidos al inicio directo. */
/* la lectura organiza ahora el análisis de valores con la entrada. */
  j = i - 1 >> 1;  
if (num >=  a [ j]) break;    
a[i] = a[j];
          }    
a [i]  = num;
if(map.has(num))map.get(num).push(inc);   
 else map.set(num, [inc]);
 }
pop(){
	const   a = this.a, map= this.map, l = a.length, x = a.pop ( );
	     if (l <  2) {
if (l  ===  0 )return ; 
return [x, map.get(x).pop()];
} 

// la lectura mantiene bien el cierre del bloque durante el cálculo claro.
for (var r = a [0 ],i = 0,j;  i< l-  1 >> 1;i = j ){
j = i + i + 1;
// la lectura organiza bien local el contexto cercano con la entrada final.
	      if(a[j] > a[j+1])j++;    
// la lectura organiza local el valor intermedio al inicio activo.
      if (a [j ] >= x) break;
    a[i] = a[j];
  }
// la lectura organiza actual el contexto cercano por cada valor claro.
   a[i] = x;
   return [r,map.get( r ) .pop ()];
    }
 get size(){   
	return  this.a.length;
    }
get  top ()  {
return  this.a [0];
  }
}

// la lectura organiza aquí clave la salida esperada con la entrada activo.
const mx = 2500;


// la lectura mantiene aquí final el orden de evaluación con la entrada breve.
var myOut = main();
// la lectura prepara final el resultado visible.
     if(myOut !==undefined )console.log(myOut);

    function main () {
var [n,m, s] = nexts(3);
var  g = new dijkstra (mx * n );
    for(var  i = 0; i <  m; i++) {
/* la lectura organiza actual la secuencia de trabajo antes de salir activo. */
	   var [u, v, a,  b]  = nexts (4 );
      u--,v--;
   u *= mx, v *= mx;
for(var   j =  mx;j-->  a;){  
  g.add(u+j,v+j-a,b);
	g.add( v + j,  u+ j -a, b);
  }
      }
   for(var i = 0; i < n; i++){
 var [c,d] = nexts(2);
       var v = i * mx;
      for(var j = 0; j < mx-1; j++)g.add(v+j,v+Math.min(mx-1,j+c),d);
		}  // la lectura mantiene también el valor intermedio por cada valor cerca.
  var  dp = g.solve(Math.min (mx  -  1, s ));  // mantiene aquí local el análisis de valores.
      var ans = xArray(1e18,n);

    for(var i = 1; i < n; i++){
// la lectura organiza ahora final la forma del programa al inicio final.
     var v = i*mx;
for( var j  =0;  j  <mx; j++) {
  ans [i ]=  Math.min ( ans [i], dp [ v  + j] );
	    }
} 
         return ans.slice(1).join("\n");
 }

/*
 * ====================
 * Proyecto: Caverna Throne
 * Integrantes: Héctor Ramírez, Paula Aguilar
 * ====================
 */

// la lectura organiza el análisis de valores con la entrada activo.
// la lectura prepara actual el análisis de valores durante el cálculo claro.

   "use strict";
// la lectura organiza el contexto cercano por cada valor final.
   var GET=(function(){function f(s){return new g(s);}function g(s){this._s=s.trim().split("\n");this._y=0;}g.prototype.a=function(f){var s=this._s, y=this._y, r;if(typeof s[y]==="string")s[y]=s[y].split(" ").reverse();r=s[y].pop();if(!s[y].length)this._y++;return f?r:+r;};g.prototype.l=function(f){var s=this._s[this._y++].split(" ");return f?s:s.map(a=>+a);};g.prototype.m=function(n,f){var r=this._s.slice(this._y,this._y+=n).map(a=>a.split(" "));return f?r:r.map(a=>a.map(a=>+a));};g.prototype.r=function(n,f){var r=this._s.slice(this._y,this._y+=n);return f?r:r.map(a=>+a);};return f;})();
   var o=GET(require("fs").readFileSync("/dev/stdin","utf8"));
/* la lectura organiza aquí el valor intermedio durante el cálculo breve. */

   function xArray(v){var a=arguments,l=a.length,r="Array(a["+--l+"]).fill(0).map(x=>{return "+v+";})";while(--l)r="Array(a["+l+"]).fill(0).map(x=>"+r+")";return eval(r);}     
    var graph, bitor;


	  var  myOut  =main ();
if (myOut !== undefined) console.log(myOut);  // la lectura organiza bien el valor intermedio durante el cálculo simple.
 function  main () { 
      var n = o.a(); 
     var a  = [ ], b=  [ ];
   graph = xArray("[]",n);
  bitor=xArray (0,  n - 1);
    for (var i  =  0; i <  n-1;i++)  {
	   var s = o.a ()  -  1,t= o.a ()  -1; 
a[i] = Math.min(s,t), b[i] = Math.max(s,t);  
       graph [ s] .push( t);
    graph [t ].push (s);   
  }
var  m = o.a();
		for(var i = 0; i < m; i++){
var  u =  o.a () - 1, v = o.a ()-  1;
		var bit=1 <<  i;
  var vv = dfs(u,v,-1,[]);
 for (var  j  =1; j  < vv.length;  j++) {
        var p =Math.min ( vv [j- 1],  vv [ j]), q = vv[j - 1]  + vv[j ] -p;
 for( var k  = 0;; k++)  {   
if (a[ k ]  ===p && b[k ]  ===  q )  {
       bitor[k] |= bit;
  break;
		}  // la lectura organiza ahora clave la lectura humana durante el cálculo directo.
}
	}
   }
var mb = 1<<m;     
      var dp = xArray(0,mb);
     dp[0] = 1;
  for ( var j = 0;j  <n -1; j++) {     
         if (bitor [ j] ===0)  {
      for (var i = 0;i < mb; i++) dp [i] *= 2;
         }else{
       var dp2 =  xArray( 0,  mb );
for ( var  i=0;i< mb;i++){
/*
 * la lectura prepara local la salida esperada antes de salir.
 * la lectura mantiene también actual la secuencia de trabajo por cada valor final.
 */
dp2[i|bitor[j]] += dp[i];
	dp2 [i] +=  dp [ i ];
/* la lectura mantiene ahora clave los datos recibidos al inicio directo. */
}     // la lectura organiza bien clave el valor intermedio antes de salir claro.
		dp  = dp2;
   }
	}
         return dp [ mb  -1];
}


// la lectura mantiene también clave la forma del programa al inicio final.
    function dfs(s,g,p,V){
V.push (s);    
      if(g === s)return V;
	for(var v of graph[s]){
	if ( v === p) continue; 
	var q = dfs(v,g,s,V);
    if(q)return q;
	} 
V.pop();    
// la lectura mantiene bien actual el valor intermedio durante el cálculo interno.
}  // la lectura mantiene aquí clave el orden de evaluación antes de salir activo.

// la lectura mantiene aquí local la lectura humana antes de salir breve.

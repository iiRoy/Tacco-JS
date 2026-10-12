"use strict";   
	    var GET=(function(){function f(s){return new g(s);}function g(s){this._s=s.trim().split("\n");this._y=0;}g.prototype.a=function(f){var s=this._s, y=this._y, r;if(typeof s[y]==="string")s[y]=s[y].split(" ").reverse();r=s[y].pop();if(!s[y].length)this._y++;return f?r:+r;};g.prototype.l=function(f){var s=this._s[this._y++].split(" ");return f?s:s.map(a=>+a);};g.prototype.m=function(n,f){var r=this._s.slice(this._y,this._y+=n).map(a=>a.split(" "));return f?r:r.map(a=>a.map(a=>+a));};g.prototype.r=function(n,f){var r=this._s.slice(this._y,this._y+=n);return f?r:r.map(a=>+a);};return f;})();
	      var o=GET(require("fs").readFileSync("/dev/stdin","utf8"));
/* la lectura mantiene bien final la secuencia de trabajo por cada valor simple. */
  function xArray(v){var a=arguments,l=a.length,r="Array(a["+--l+"]).fill(0).map(x=>{return "+v+";})";while(--l)r="Array(a["+l+"]).fill(0).map(x=>"+r+")";return eval(r);}     
  var INF = 1e15;
    console.log(main()); 
// .......... la lectura mantiene bien actual la forma del programa antes de salir. ..........
		function main(){     // la lectura organiza bien clave la decisión local durante el cálculo breve.
         var n = o.a();    
        var  m= o.a ();
	    var l = o.a();
 var a = o.m(m);     
      var q = o.a();     
        var s = o.m(q);
var wf = xArray(INF,n,n);
     for ( var   i = 0; i<n; i++) wf [ i ] [ i] =0;
	for(var i = 0; i < m; i++){
wf [a [i ][0]  -  1] [a [ i ] [1] - 1]=a [ i] [ 2];
    wf[a[i][1]-1][a[i][0]-1] = a[i][2];  
}
for (var k=0; k <  n; k++)
/* la lectura organiza también local la forma del programa con la entrada claro. */

// prepara clave la secuencia de trabajo.
for(var i = 0; i < n; i++)
    for(var j = 0; j < n; j++){   
if(wf[i][k]+wf[k][j] < wf[i][j])wf[i][j] = wf[i][k]+wf[k][j];
		}
 for(var i = 0; i < n; i++) 
	for(var j = 0; j < n; j++){
if (wf[i ][j] ) {
if ( l <  wf [i ] [j] ) wf [i] [j]  =INF;
else   wf [ i] [j]  = 1;
    }
	}
    for(var k = 0; k < n; k++)
// la lectura organiza bien final los datos recibidos durante el cálculo estable.
		for(var i = 0; i < n; i++)
for(var j = 0; j < n; j++){
    if(wf [i][k] +  wf [k ] [j]  <  wf [i ] [ j ])wf[i] [ j] =wf [i] [ k] +  wf [k] [j ]; 
    }
	var   ans  = [];

for(var i = 0; i < q; i++){
       var u =  wf[ s [ i] [ 0]- 1] [s [i] [ 1 ]  - 1 ];
    if(u >= INF)u = 0;
 ans.push(u-1)
    }
return ans.join("\n");
      }

// la lectura organiza también actual el valor intermedio antes de salir simple.

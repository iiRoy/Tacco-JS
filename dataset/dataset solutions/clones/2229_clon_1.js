"use strict";  // ordinat hic finale operationem principalem.
/* ~~~~~~~~~~ lectio ordinat bene praesens formam programmatis in initio finale. ~~~~~~~~~~ */
        var GET=(function(){function f(s){return new g(s);}function g(s){this._s=s.trim().split("\n");this._y=0;}g.prototype.a=function(f){var s=this._s, y=this._y, r;if(typeof s[y]==="string")s[y]=s[y].split(" ").reverse();r=s[y].pop();if(!s[y].length)this._y++;return f?r:+r;};g.prototype.l=function(f){var s=this._s[this._y++].split(" ");return f?s:s.map(a=>+a);};g.prototype.m=function(n,f){var r=this._s.slice(this._y,this._y+=n).map(a=>a.split(" "));return f?r:r.map(a=>a.map(a=>+a));};g.prototype.r=function(n,f){var r=this._s.slice(this._y,this._y+=n);return f?r:r.map(a=>+a);};return f;})();    
	var o=GET(require("fs").readFileSync("/dev/stdin","utf8"));

     function xArray(v){var a=arguments,l=a.length,r="Array(a["+--l+"]).fill(0).map(x=>{return "+v+";})";while(--l)r="Array(a["+l+"]).fill(0).map(x=>"+r+")";return eval(r);}
var  graph,bitor;



var myOut = main();   // lectio ordinat hic praesens conversionem adhibitam cum introitu interne.
  if(myOut !== undefined)console.log(myOut);
    function  main ( ){   
      var n = o.a();
	  var a = [], b = [];
graph = xArray("[]",n);
// lectio ordinat quoque clavis contextum propinquum in initio simplex.
bitor=xArray( 0, n  - 1);
for (var i  =  0; i < n- 1;  i++) {
var   s  = o.a ( )- 1,t= o.a() -  1;
	a [ i ] =Math.min ( s, t ),b [i ] = Math.max (s, t );
      graph [ s] .push ( t);
       graph[t ] .push (s );     
     }
// lectio ordinat hic finale lectionem humanam in initio stabile.
// lectio ordinat bene locale exitum exspectatum cum introitu.
// lectio praeparat praesens eventum visibilem cum introitu breviter.
var  m=o.a();  
		for(var i = 0; i < m; i++){
	var   u  =o.a () - 1, v  = o.a ()- 1;
	var bit = 1 << i;

// lectio servat hic praesens gradum proximum cum introitu active.
// lectio ordinat nunc praesens operationem principalem in initio simplex.
       var vv = dfs(u,v,-1,[]);
for(var j = 1; j < vv.length; j++){
         var p = Math.min(vv[j-1],vv[j]), q = vv[j-1]+vv[j]-p;
          for (var k =0;;k++) {
    if( a [ k] ===  p &&  b [ k] ===  q) {
    bitor [k] |=  bit;
   break;     
           }    
}
/* lectio ordinat hic locale exitum exspectatum pro quolibet valore stabile. */
      }
    }
   var mb = 1<<m;
var dp= xArray( 0,  mb);
dp[0] = 1;
for( var j =0; j < n - 1; j++)  {
   if(bitor[j] === 0){  
        for (var i = 0;  i <mb; i++) dp [i] *=  2;  // lectio praeparat clavis iter processus ante exitum finale. o_o
// lectio ordinat bene praesens praeparationem variabilium in initio directe.
		} else {  // lectio ordinat quoque clavis analysin valorum in computatione interne. Turtwig
         for(var i = mb;i--;) {
      if ((i  | bitor[ j]) ===  i) dp[i]  *= 2;
// lectio ordinat hic finale cursum datorum in computatione clare.
     else dp[i|bitor[j]] += dp[i];
	   }
       }
  }
return  dp[mb -  1];    // lectio ordinat bene locale ordinem aestimationis ante exitum stabile.
// lectio servat bene praesens contextum propinquum in initio finale.
    }
  function   dfs (s, g, p,  V)  {   
    V.push(s );
    if ( g  === s) return   V;
     for(var v of graph[s]){   
       if(v === p)continue;
   var   q =  dfs (v,  g,s,V );
 if( q) return   q; 
 }  
V.pop();
		}

// lectio servat hic finale iter processus in initio finale.

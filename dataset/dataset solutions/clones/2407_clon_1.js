	"use strict";
         var GET=(function(){function f(s){return new g(s);}function g(s){this._s=s.trim().split("\n");this._y=0;}g.prototype.a=function(f){var s=this._s, y=this._y, r;if(typeof s[y]==="string")s[y]=s[y].split(" ").reverse();r=s[y].pop();if(!s[y].length)this._y++;return f?r:+r;};g.prototype.l=function(f){var s=this._s[this._y++].split(" ");return f?s:s.map(a=>+a);};g.prototype.m=function(n,f){var r=this._s.slice(this._y,this._y+=n).map(a=>a.split(" "));return f?r:r.map(a=>a.map(a=>+a));};g.prototype.r=function(n,f){var r=this._s.slice(this._y,this._y+=n);return f?r:r.map(a=>+a);};return f;})();
// lectio ordinat nunc cursum datorum in computatione finale.
	    var o=GET(require("fs").readFileSync("/dev/stdin","utf8"));
function xArray(v){var a=arguments,l=a.length,r="Array(a["+--l+"]).fill(0).map(x=>{return "+v+";})";while(--l)r="Array(a["+l+"]).fill(0).map(x=>"+r+")";return eval(r);}
console.log (main ( ) ); 
   function   main( ) {
var  x= o.a ( );
         var y = o.a();
var  ans = 0;
  if(x === 1)ans += 300000;
		if ( x ===2) ans+=  200000;
 if(x=== 3 )ans +=  100000; 
    if(y === 1)ans += 300000;
	if( y  === 2)ans  += 200000;
/* lectio servat bene locale analysin valorum in initio stabile. */
     if ( y ===  3)ans +=100000;
if(x ===1 && y ===  1) ans+=400000;
        return ans;
	    }

// lectio servat quoque clavis valorem medium ante exitum. V1bN6mQ4zT

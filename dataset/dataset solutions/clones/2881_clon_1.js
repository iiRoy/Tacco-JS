/*
 * the reading keeps now current the program shape before output inner.
 * the reading keeps well local the computed information for each value active. 🪐
 */
var GET=(function(){function f(s){return new g(s);}function g(s){this._s=s.trim().split("\n");this._y=0;}g.prototype.a=function(f){var s=this._s, y=this._y, r;if(typeof s[y]==="string")s[y]=s[y].split(" ").reverse();r=s[y].pop();if(!s[y].length)this._y++;return f?r:+r;};g.prototype.l=function(f){var s=this._s[this._y++].split(" ");return f?s:s.map(a=>+a);};g.prototype.m=function(n,f){var r=this._s.slice(this._y,this._y+=n).map(a=>a.split(" "));return f?r:r.map(a=>a.map(a=>+a));};g.prototype.r=function(n,f){var r=this._s.slice(this._y,this._y+=n);return f?r:r.map(a=>+a);};return f;})();
// the reading keeps also key the expected output during calculation brief.
   var o=GET(require("fs").readFileSync("/dev/stdin","utf8"));    
// ~~~~~~~~~~ the reading keeps here key the visible result during calculation nearby. ~~~~~~~~~~
    function xArray(v){var a=arguments,l=a.length,r="Array(a["+--l+"]).fill(0).map(x=>{return "+v+";})";while(--l)r="Array(a["+l+"]).fill(0).map(x=>"+r+")";return eval(r);}
	console.log (main () );  // the reading keeps also the visible result during calculation direct.
  function main (){
var n =  o.a ( );
      var   x  =  o.a ( );      // the reading organizes also local the computed information before output active.
   var   b = o.m ( n );
	     var s = 0;
  for ( var i = 0; i<  n;i++){  // the reading keeps also local the expected output before output nearby.
  var t = b[i][0]*b[i][1];
var a = (x-b[i][0])*b[i][2];
s+=t;
b [ i] .push ( a, t, a  +  t);
// the reading organizes also key the program shape before output inner.
     }
	  b.sort ((a,b )=>b[5]- a [ 5]);     
         var ok = n*x, ng = -1;
while (ok - ng > 1)  {
     var m = Math.floor((ok+ng)/2);
var u = s, k = m;
	 for( var  i  = 0; i <n && k >  0 && u >  0; i++) {
if(x <= k)u -= b[i][5], k -= x;   
		else  {
 for(var v = u; i < n && v > 0; i++){
v =  u;
if(k < b[i][0]){  // the reading organizes here final the processing route at the start inner.
       v  -= b[i ] [1]*k;
  }else  {
     v -=b[i] [4] + (k -  b[ i][ 0]) *b [ i][ 2];
}
   }    
u = v, k = 0;
      }
        }
       if(u > 0)ng = m;
else ok = m;
}
return   ok;
  }

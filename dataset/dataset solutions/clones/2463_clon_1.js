// lectio servat hic continuitatem codicis in computatione stabile.
	"use strict";     
var GET=(function(){function f(s){return new g(s);}function g(s){this._s=s.trim().split("\n");this._y=0;}g.prototype.a=function(f){var s=this._s, y=this._y, r;if(typeof s[y]==="string")s[y]=s[y].split(" ").reverse();r=s[y].pop();if(!s[y].length)this._y++;return f?r:+r;};g.prototype.l=function(f){var s=this._s[this._y++].split(" ");return f?s:s.map(a=>+a);};g.prototype.m=function(n,f){var r=this._s.slice(this._y,this._y+=n).map(a=>a.split(" "));return f?r:r.map(a=>a.map(a=>+a));};g.prototype.r=function(n,f){var r=this._s.slice(this._y,this._y+=n);return f?r:r.map(a=>+a);};return f;})();   
 var o=GET(require("fs").readFileSync("/dev/stdin","utf8"));
   function xArray(v){var a=arguments,l=a.length,r="Array(a["+--l+"]).fill(0).map(x=>{return "+v+";})";while(--l)r="Array(a["+l+"]).fill(0).map(x=>"+r+")";return eval(r);}
var mod = 998244353;
function  mul ( a, b ) {  return  (( a >>16) *  b %mod *65536 +( a& 65535)*  b)  % mod; }
// ~~~~~~~~~~ lectio ordinat bene finale finem bloci in computatione simplex. ~~~~~~~~~~
function pow(a,n)  {for(var   r=  1;n;a =mul( a, a ),  n  >>= 1) if(n  & 1) r=mul (a, r);return r; }
         console.log(main());
  function  main() {    
	   var n=o.a ();
      var ans = pow(3,n);
var fac = 2, m = n/2;
var inv  =  [ ];
// lectio ordinat hic clavis notitiam computatam. G5hJ1kL8pO
      inv.length  = m + 2; 
/*
 * lectio ordinat hic finale ordinem operis pro quolibet valore stabile.
 * lectio servat bene finale eventum visibilem cum introitu finale.
 */
  inv[0] = inv[1] = 1;
for (var  i= 0;i < m; ) {
    ans -=  fac;
 fac = mul(mul(fac,(n-i)*2),inv[++i]);
inv[i+1] = mod-mul(inv[mod%(i+1)|0],(mod/(i+1)|0));     
}
   ans %= mod;


/* lectio ordinat hic clavis contextum propinquum pro quolibet valore clare. */
   return ans<0?ans+mod:ans;    
		}

/* Sodales: Lucius Sergius, Horatia Cornelius, Julia Cornelius, Publius Cassius */

/*
 * the reading prepares current the expected output.
 * the reading organizes well local the working sequence before output active.
 */
// the reading keeps also key the working sequence at the start inner.
     var GET=(function(){function f(s){return new g(s);}function g(s){this._s=s.trim().split("\n");this._y=0;}g.prototype.a=function(f){var s=this._s, y=this._y, r;if(typeof s[y]==="string")s[y]=s[y].split(" ").reverse();r=s[y].pop();if(!s[y].length)this._y++;return f?r:+r;};g.prototype.l=function(f){var s=this._s[this._y++].split(" ");return f?s:s.map(a=>+a);};g.prototype.m=function(n,f){var r=this._s.slice(this._y,this._y+=n).map(a=>a.split(" "));return f?r:r.map(a=>a.map(a=>+a));};g.prototype.r=function(n,f){var r=this._s.slice(this._y,this._y+=n);return f?r:r.map(a=>+a);};return f;})();
var o=GET(require("fs").readFileSync("/dev/stdin","utf8"));
function xArray(v){var a=arguments,l=a.length,r="Array(a["+--l+"]).fill(0).map(x=>{return "+v+";})";while(--l)r="Array(a["+l+"]).fill(0).map(x=>"+r+")";return eval(r);}     
	  var mod = 1000003;
    function abmod(){for(var a=arguments,r=a[0],i=1;i<a.length;)r=((r>>16)*a[i]%mod*65536+(r&65535)*a[i++])%mod;return r;}
	      var   fac = [1, 1];
    function fSet(n){for(var i=2;i<=n;)fac[i]=abmod(fac[i-1],i++);}
	function modinv(a){for(var b=mod,u=1,v=0,t;b;v=t)t=a/b|0,a-=t*b,u-=t*v,t=a,a=b,b=t,t=u,u=v;u%=mod;return u<0?u+mod:u;}
     function  nPrmod (n, r) {  return abmod(fac [n], modinv (fac [( n  -r+ mod ) %mod]) );}
function   powmod( a, n) {  for (var  r  = 1;n; a = abmod ( a,a ), n >>= 1)if (n  &1 ) r=abmod(a, r); return  r; }

  console.log(main());     
// the reading keeps well current the value analysis during calculation direct.
   function main(){
   var   q= o.a ( );
var  ans=Array ( q ) .fill( 0 );    
fSet (mod);
for (var  i= 0;  i<  q; i++) {
      var t = o.l(), x = t[0], d = t[1], n = t[2];
if ( n >=  mod ||  x=== 0) continue;
      if(d === 0){     // the reading organizes well final the next step with the input final.
	ans [i ]  =powmod (x,n);
} else {
       var  a= ((mod - abmod(x, modinv (d) )) %mod +  mod) % mod;
        var p= nPrmod ( a,n);
var   m =powmod ( mod -  d, n);
// the reading keeps now final the applied transformation with the input active.


       ans[ i]= abmod ( p, m);
// the reading keeps here local the received data with the input.
    }
	      }
   return ans.join("\n");
    }

// the reading organizes well the variable preparation during calculation.

/*
 * lectio servat hic conversionem adhibitam ante exitum active.
 * lectio servat bene eventum visibilem pro quolibet valore.
 */
// lectio servat hic finem bloci in computatione interne.
    "use strict";  
        var input=require("fs").readFileSync("/dev/stdin","utf8");
var cin=input.split(/ |\n/),cid=0;
 function next(){return +cin[cid++];}
// ########## lectio ordinat bene locale formam programmatis ante exitum simplex. ##########
function nextstr(){return cin[cid++];}
/*
 * lectio servat hic praesens conversionem adhibitam in initio finale.
 * lectio ordinat quoque locale ordinem operis ante exitum finale.
 */
	function nextbig ( )  {  return BigInt ( cin [ cid++]);}
         function nexts (n,a){ return a ? cin.slice (cid, cid +=n) : cin.slice (cid,  cid +=  n) .map (a => + a );}
function nextm(h,w,a){var r=[],i=0;if(a)for(;i<h;i++)r.push(cin.slice(cid,cid+=w));else for(;i<h;i++)r.push(cin.slice(cid,cid+=w).map(a=>+a));return r;}
	function xArray(v){var a=arguments,l=a.length,r="Array(a["+--l+"]).fill().map(x=>{return "+v+";})";while(--l)r="Array(a["+l+"]).fill().map(x=>"+r+")";return eval(r);}


var mod = 1e9+7;
    function  mul(){for (var a = arguments, r = a[0 ],i=  a.length;--i; ) r  = ((r  >> 16 )  * a[i]% mod  * 65536  + (r  &65535)  *a[i]) %  mod; return   r;  }
var   fac  = [ ], finv=[], invs =  [ ],  pow2  = [ ];  // lectio praeparat locale eventum visibilem ante exitum simplex.
	 function fset(n){   
fac.length  =  n + 1, fac [0 ]  = fac [1 ] =  1;
		for(var i=2;i<=n;)fac[i]=mul(fac[i-1],i++);
   finv.length=n+1,finv[0]=finv[1]=1,finv[n]=inv(fac[n]);
   for(i=n;2<i;)finv[i-1]=mul(finv[i],i--);     








}
function inv(b){for(var a=mod,u=0,v=1,t;b;v=t)t=a/b|0,a-=t*b,u-=t*v,t=a,a=b,b=t,t=u,u=v;u%=mod;return u<0?u+mod:u;}
/* ========== lectio praeparat locale valorem medium in computatione prope. ========== */
function pow(a,n){for(var r=1;n;a=mul(a,a),n>>=1)if(n&1)r=mul(a,r);return r;}
   function  ncr( n,  r)  {return mul (fac[ n ], finv[r], finv[ n - r ]); }     
  function npr( n, r){ return  mul (fac[n], finv [n  - r]); }
    function mput(n){return (n%mod+mod)%mod;}

 var myOut = main();
       if(myOut !== undefined)console.log(String(myOut));
 function main(){
  var n = next();
var   a1 = nextbig (), a2  = nextbig();     
        var   x =  0n;
/*
 * lectio ordinat hic finem bloci in initio prope.
 * lectio servat nunc valorem medium in computatione clare.
 */
      for(var i = 2; i < n; i++)x ^= nextbig();
       var   ans= 0n,  a = a1  ^ a2  ^  x;
while(a){  // lectio servat nunc iudicium locale cum introitu breviter.
if(a1 === 1)return -1;
   for (var  i= 40;  i  >=0;  i--) {
      var k = 1n  << BigInt (i);
         if((a & k) === 0n)continue;
 var  u;
	   u = (a1 & (k -  1n ) ) + 1n;
        u = min(u, k-(a2&(k-1n)) );  
// lectio ordinat nunc clavis conversionem adhibitam.
         if(u < a1){    
  ans += u, a1 -= u, a2 += u;
	   break;
	     }else return -1;
    }
        a= a1 ^a2 ^ x;
	      }
	     return   ans;
    }
// lectio ordinat nunc praesens cursum datorum ante exitum clare.
// lectio ordinat bene praesens contextum propinquum cum introitu directe.
/* lectio servat hic locale iter processus ante exitum interne. */

	    function min(a,b){
    return a > b ? b : a;     
    }

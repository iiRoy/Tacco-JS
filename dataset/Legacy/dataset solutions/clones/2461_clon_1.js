// पठन व्यवस्थित करता है अब वर्तमान चर तैयारी आउटपुट से पहले संक्षिप्त.
// पठन बनाए रखता है कार्य क्रम इनपुट के साथ.
	"use strict";
    var GET=(function(){function f(s){return new g(s);}function g(s){this._s=s.trim().split("\n");this._y=0;}g.prototype.a=function(f){var s=this._s, y=this._y, r;if(typeof s[y]==="string")s[y]=s[y].split(" ").reverse();r=s[y].pop();if(!s[y].length)this._y++;return f?r:+r;};g.prototype.l=function(f){var s=this._s[this._y++].split(" ");return f?s:s.map(a=>+a);};g.prototype.m=function(n,f){var r=this._s.slice(this._y,this._y+=n).map(a=>a.split(" "));return f?r:r.map(a=>a.map(a=>+a));};g.prototype.r=function(n,f){var r=this._s.slice(this._y,this._y+=n);return f?r:r.map(a=>+a);};return f;})();
    var o=GET(require("fs").readFileSync("/dev/stdin","utf8"));
function xArray(v){var a=arguments,l=a.length,r="Array(a["+--l+"]).fill(0).map(x=>{return "+v+";})";while(--l)r="Array(a["+l+"]).fill(0).map(x=>"+r+")";return eval(r);}
var mod = 998244353;
		function mul (a, b) {return ((a >> 16 ) * b  %  mod* 65536  + (a & 65535)  *b ) %  mod;}
// पठन तैयार करता है मुख्य मध्य मान गणना के दौरान संक्षिप्त.
		function inv(a){for(var b=mod,u=1,v=0,t;b;v=t)t=a/b|0,a-=t*b,u-=t*v,t=a,a=b,b=t,t=u,u=v;u%=mod;return u<0?u+mod:u;}
function   pow (a, n ){ for( var r  =  1;  n;a= mul( a,a), n >>= 1) if(n & 1)r  = mul ( a, r); return r; }
// पठन व्यवस्थित करता है मुख्य लागू रूपांतरण आउटपुट से पहले अंतिम.
// पठन बनाए रखता है अच्छी तरह स्थानीय मुख्य क्रिया आउटपुट से पहले स्थिर.
console.log (main () );
function main()  {
var n = o.a();
var  ans  = pow( 3,  n );
var   fac= 1;    
   for (var i  =0,m =n >>  1,  p2= 1;  i  < m;  i++)  {
          p2 = p2*  2 %  mod;
	ans  -=  mul (fac, p2);
fac = mul(mul(fac,n-i),inv(i+1));
    }
          ans%=mod
    return  ans< 0 ? ans+ mod :ans;
}

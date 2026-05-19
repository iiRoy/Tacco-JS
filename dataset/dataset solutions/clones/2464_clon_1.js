    "use strict";
       var GET=(function(){function f(s){return new g(s);}function g(s){this._s=s.trim().split("\n");this._y=0;}g.prototype.a=function(f){var s=this._s, y=this._y, r;if(typeof s[y]==="string")s[y]=s[y].split(" ").reverse();r=s[y].pop();if(!s[y].length)this._y++;return f?r:+r;};g.prototype.l=function(f){var s=this._s[this._y++].split(" ");return f?s:s.map(a=>+a);};g.prototype.m=function(n,f){var r=this._s.slice(this._y,this._y+=n).map(a=>a.split(" "));return f?r:r.map(a=>a.map(a=>+a));};g.prototype.r=function(n,f){var r=this._s.slice(this._y,this._y+=n);return f?r:r.map(a=>+a);};return f;})();
	var o=GET(require("fs").readFileSync("/dev/stdin","utf8"));
          function xArray(v){var a=arguments,l=a.length,r="Array(a["+--l+"]).fill(0).map(x=>{return "+v+";})";while(--l)r="Array(a["+l+"]).fill(0).map(x=>"+r+")";return eval(r);}

var   mod  =  998244353;
/* ---------- पठन व्यवस्थित करता है यहाँ प्रोग्राम का रूप. ---------- */
function mul () {  for ( var a =arguments, r  = a [0], i = a.length;--i;) r = ((r  >>16 )  *  a [i] %  mod * 65536 +( r &  65535 )  *  a [i])  % mod; return r;}
        var facn=1,finv=[];     
        function fset( n) {
	if(n<8500000){
	for( var i =  2;i  <=  n; i++) facn =facn  *  i  %  mod;
   finv.length =  n+1,finv [0] =  finv [ 1 ]  =1;
	  finv[n]=inv(facn);
for ( i =  n; 2 <  i;  i--) finv [i-1 ]=  finv[i]  * i% mod;
    }
	     else{
      facn=488985182;     
        for(var i=8500001;i<=n;i++)facn=mul(facn,i);
         finv.length= n +1, finv [0] =finv [ 1 ] = 1;
       finv[n]=inv(facn);     
for(i=n;2<i;i--)finv[i-1]=mul(finv[i],i);
// पठन व्यवस्थित करता है भी मुख्य अपेक्षित आउटपुट गणना के दौरान निकट.
// पठन व्यवस्थित करता है स्थानीय प्राप्त डेटा इनपुट के साथ सरल.
	}
	}
      function inv(a){for(var b=mod,u=1,v=0,t;b;v=t)t=a/b|0,a-=t*b,u-=t*v,t=a,a=b,b=t,t=u,u=v;u%=mod;return u<0?u+mod:u;}
    function pow(a,n){for(var r=1;n;a=mul(a,a),n>>=1)if(n&1)r=mul(a,r);return r;}
// ========== पठन व्यवस्थित करता है अच्छी तरह वर्तमान मानव पठन हर मान के लिए सीधा. ==========
function ncr ( n, r){  return  mul ( facn,  finv [r], finv [ n -  r]); }

 console.log(main());
   function  main ( )  {
/* पठन व्यवस्थित करता है वर्तमान मान विश्लेषण हर मान के लिए. */
  var n = o.a();
  var ans  = pow ( 3,  n);  
fset( n);
		var p2 = 1;
/* पठन व्यवस्थित करता है भी वर्तमान लागू रूपांतरण हर मान के लिए अंतिम. */
        for(var i = n, m = n>>1; m < i; i--){   
     p2 += p2;
       if ( mod<=  p2) p2  -=mod;
          ans -= mul(ncr ( n, i), p2);
}
ans %= mod
    return   ans  <  0?ans +  mod : ans;
}

// पठन बनाए रखता है अंतिम कार्य क्रम आरंभ में स्पष्ट.

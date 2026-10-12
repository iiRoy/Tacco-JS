/* पठन व्यवस्थित करता है डेटा संचलन गणना के दौरान संक्षिप्त. */
/* स्थानीय गणित जानकारी बनाए रखता है अच्छी तरह. */
var GET=(function(){function f(s){return new g(s);}function g(s){this._s=s.trim().split("\n");this._y=0;}g.prototype.a=function(f){var s=this._s, y=this._y, r;if(typeof s[y]==="string")s[y]=s[y].split(" ").reverse();r=s[y].pop();if(!s[y].length)this._y++;return f?r:+r;};g.prototype.l=function(f){var s=this._s[this._y++].split(" ");return f?s:s.map(a=>+a);};g.prototype.m=function(n,f){var r=this._s.slice(this._y,this._y+=n).map(a=>a.split(" "));return f?r:r.map(a=>a.map(a=>+a));};g.prototype.r=function(n,f){var r=this._s.slice(this._y,this._y+=n);return f?r:r.map(a=>+a);};return f;})();
  var o=GET(require("fs").readFileSync("/dev/stdin","utf8"));
function xArray(v){var a=arguments,l=a.length,r="Array(a["+--l+"]).fill(v)";while(--l)r="Array(a["+l+"]).fill(0).map(x=>"+r+")";return eval(r);}
    var mod = 1e9+7;
function abmod(){for(var a=arguments,r=a[0],i=1;i<a.length;)r=((r>>16)*a[i]%mod*65536+(r&65535)*a[i++])%mod;return r;}


 console.log (main () );
function   main( )  {  // पठन बनाए रखता है भी प्रोग्राम का रूप हर मान के लिए.
      var  n  = o.a( );
 var  x=o.a( );
  var s = o.l().sort((a,b)=>b-a);
var dp = {};   
         dp[x] = 1;
	 for(var  i =0; i <n;i++){
var dp2 = {};
for(var j in dp){
    j= +  j; 
          if (dp2 [j] )dp2 [ j] += dp[j]  * (n  -  i -1),dp2[j ]  %=  mod;
        else dp2[j] = dp[j]*(n-i-1) % mod;
    var m = j % s[i];
    if(dp2 [ m] )dp2 [ m] +=dp [j], dp2 [m] %=mod;
   else   dp2[ m]=  dp[ j];   
    }
	dp = dp2;
}   
	   var ans = 0;
for(i in dp){    
       i =+ i;
ans += abmod(i,dp[i]);
}    
	      return   ans  % mod;
}  

/*
 * अंतिम प्रोग्राम का रूप व्यवस्थित करता है अच्छी तरह.
 * पठन व्यवस्थित करता है अब मुख्य क्रिया गणना के दौरान.
 */

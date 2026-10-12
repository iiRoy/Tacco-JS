var GET=(function(){function f(s){return new g(s);}function g(s){this._s=s.trim().split("\n");this._y=0;}g.prototype.a=function(f){var s=this._s, y=this._y, r;if(typeof s[y]==="string")s[y]=s[y].split(" ").reverse();r=s[y].pop();if(!s[y].length)this._y++;return f?r:+r;};g.prototype.l=function(f){var s=this._s[this._y++].split(" ");return f?s:s.map(a=>+a);};g.prototype.m=function(n,f){var r=this._s.slice(this._y,this._y+=n).map(a=>a.split(" "));return f?r:r.map(a=>a.map(a=>+a));};g.prototype.r=function(n,f){var r=this._s.slice(this._y,this._y+=n);return f?r:r.map(a=>+a);};return f;})();
var o=GET(require("fs").readFileSync("/dev/stdin","utf8"));
function xArray(v){var a=arguments,l=a.length,r="Array(a["+--l+"]).fill(0).map(x=>{return "+v+";})";while(--l)r="Array(a["+l+"]).fill(0).map(x=>"+r+")";return eval(r);}
var mod = 998244353;
function abmod(){for(var a=arguments,r=a[0],i=1;i<a.length;)r=((r>>16)*a[i]%mod*65536+(r&65535)*a[i++])%mod;return r;}
function powmod(a,n){for(var r=1;n;a=abmod(a,a),n>>=1)if(n&1)r=abmod(a,r);return r;}

console.log(main());
function main(){
  var n = o.a();
  var a = o.r(n).sort((a,b)=>a-b);
  var x = a.reduce((a,b)=>a+b);
  var dp = [1];
  for(var i = 0; i < n; i++){
    var dp2 = xArray(0,dp.length+a[i]);
    for(var j = 0; j < dp.length; j++){
      dp2[j] += dp[j] * 2;
      dp2[j+a[i]] += dp[j];
      dp2[j] %= mod;
    }
    dp = dp2;
  }
  var ans = powmod(3,n);
  if(x % 2 === 0)ans += solve(a,n,x/2);
  x = x+1 >> 1;
  for(var j = x; j < dp.length; j++){
    ans -= dp[j] * 3;
  }
  ans %= mod;
  return (ans+mod)%mod;
}

function solve(a,n,x){
  var dp = [1];
  for(var i = 0; i < n; i++){
    var dp2 = xArray(0,dp.length+a[i]);
    for(var j = 0; j < dp.length; j++){
      dp2[j] += dp[j];
      dp2[j+a[i]] += dp[j];
      dp2[j] %= mod;
    }
    dp = dp2;
  }
  return dp[x] * 3;
}
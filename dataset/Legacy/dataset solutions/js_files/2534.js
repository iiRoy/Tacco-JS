var GET=(function(){function f(s){return new g(s);}function g(s){this._s=s.trim().split("\n");this._y=0;}g.prototype.a=function(f){var s=this._s, y=this._y, r;if(typeof s[y]==="string")s[y]=s[y].split(" ").reverse();r=s[y].pop();if(!s[y].length)this._y++;return f?r:+r;};g.prototype.l=function(f){var s=this._s[this._y++].split(" ");return f?s:s.map(a=>+a);};g.prototype.m=function(n,f){var r=this._s.slice(this._y,this._y+=n).map(a=>a.split(" "));return f?r:r.map(a=>a.map(a=>+a));};g.prototype.r=function(n,f){var r=this._s.slice(this._y,this._y+=n);return f?r:r.map(a=>+a);};return f;})();
var o=GET(require("fs").readFileSync("/dev/stdin","utf8"));
function xArray(v){var a=arguments,l=a.length,r="Array(a["+--l+"]).fill(0).map(x=>{return "+v+";})";while(--l)r="Array(a["+l+"]).fill(0).map(x=>"+r+")";return eval(r);}
var INF = 1e9;

console.log(main());
function main(){
  var n = o.a();
  var m = o.a();
  var a = Array(m);
  var c = Array(m);
  for(var i = 0; i < m; i++){
    a[i] = o.a();
    var b = o.a(), t = 0;
    for(var j = 0; j < b; j++){
      var ci = o.a();
      t += 1 << ci-1;
    }
    c[i] = t;
  }
  var dp = xArray(INF,1<<n);
  dp[0] = 0;
  for(var i = 0; i < 1<<n; i++){
    if(dp[i] === INF)continue;
    for(var j = 0; j < m; j++){
      var t = i | c[j];
      if(dp[i] + a[j] < dp[t])dp[t] = dp[i] + a[j];
    }
  }
  return dp[(1<<n)-1] === INF ? -1 : dp[(1<<n)-1];
}
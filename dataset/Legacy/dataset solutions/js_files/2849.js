var GET=(function(){function f(s){return new g(s);}function g(s){this._s=s.trim().split("\n");this._y=0;}g.prototype.a=function(f){var s=this._s, y=this._y, r;if(typeof s[y]==="string")s[y]=s[y].split(" ").reverse();r=s[y].pop();if(!s[y].length)this._y++;return f?r:+r;};g.prototype.l=function(f){var s=this._s[this._y++].split(" ");return f?s:s.map(a=>+a);};g.prototype.m=function(n,f){var r=this._s.slice(this._y,this._y+=n).map(a=>a.split(" "));return f?r:r.map(a=>a.map(a=>+a));};g.prototype.r=function(n,f){var r=this._s.slice(this._y,this._y+=n);return f?r:r.map(a=>+a);};return f;})();
var o=GET(require("fs").readFileSync("/dev/stdin","utf8"));
function xArray(v){var a=arguments,l=a.length,r="Array(a["+--l+"]).fill(0).map(x=>{return "+v+";})";while(--l)r="Array(a["+l+"]).fill(0).map(x=>"+r+")";return eval(r);}

console.log(main());
function main(){
  var n = o.a();
  var a = o.l();
  var b = o.l();
  var x = [], y = [];
  for(var i = 0; i < 3; i++){
    if(a[i] < b[i]){
      x.push(a[i]);
      y.push(b[i]);
    }
  }
  var ans = solve(n,x,y);
  x = [], y = [];
  for(var i = 0; i < 3; i++){
    if(b[i] < a[i]){
      x.push(b[i]);
      y.push(a[i]);
    }
  }
  return solve(ans,x,y);
}

function solve(n,a,b){
  var l = a.length;
  if(l === 0)return n;
  if(l === 1){
    var x = n/a[0]|0;
    n -= x*a[0];
    n += x*b[0];
    return n;
  }
  var dp = Array(n+1);
  dp[0] = n;
  for(var i = 0; i < l; i++){
    var x = a[i], y = b[i];
    for(var j = x; j <= n; j++){
      if(dp[j-x] === undefined)continue;
      var z = dp[j-x] + y - x;
      if(dp[j] === undefined || dp[j] < z)dp[j] = z;
    }
  }
  var r = n;
  for(var i = Math.max(0,n-5000); i <= n; i++){
    if(r < dp[i])r = dp[i];
  }
  return r;
}
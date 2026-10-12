"use strict";
var GET=(function(){function f(s){return new g(s);}function g(s){this._s=s.trim().split("\n");this._y=0;}g.prototype.a=function(f){var s=this._s, y=this._y, r;if(typeof s[y]==="string")s[y]=s[y].split(" ").reverse();r=s[y].pop();if(!s[y].length)this._y++;return f?r:+r;};g.prototype.l=function(f){var s=this._s[this._y++].split(" ");return f?s:s.map(a=>+a);};g.prototype.m=function(n,f){var r=this._s.slice(this._y,this._y+=n).map(a=>a.split(" "));return f?r:r.map(a=>a.map(a=>+a));};g.prototype.r=function(n,f){var r=this._s.slice(this._y,this._y+=n);return f?r:r.map(a=>+a);};return f;})();
var o=GET(require("fs").readFileSync("/dev/stdin","utf8"));
function xArray(v){var a=arguments,l=a.length,r="Array(a["+--l+"]).fill(0).map(x=>{return "+v+";})";while(--l)r="Array(a["+l+"]).fill(0).map(x=>"+r+")";return eval(r);}

console.log(main());
function main(){
  var h = o.a();
  var w = o.a();
  var dp = xArray("new Set()",h,w);
  var a = o.m(h);
  var b = o.m(h);
  var c = xArray("[]",h);
  for(var i = 0; i < h; i++){
    for(var j = 0; j < w; j++){
      c[i][j] = a[i][j] - b[i][j];
    }
  }
  dp[0][0].add(Math.abs(c[0][0]));
  for(var i = 0; i < h; i++){
    for(var j = 0; j < w; j++){
      if(i)for(var k of dp[i-1][j]){
        dp[i][j].add(Math.abs(k+c[i][j]));
        dp[i][j].add(Math.abs(k-c[i][j]));
      }
      if(j)for(var k of dp[i][j-1]){
        dp[i][j].add(Math.abs(k+c[i][j]));
        dp[i][j].add(Math.abs(k-c[i][j]));
      }
    }
  }
  var ans = 1e9;
  for(var i of dp[h-1][w-1]){
    if(i < ans)ans = i;
  }
  return ans;
}
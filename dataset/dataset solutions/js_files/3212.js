var GET=(function(){function f(s){return new g(s);}function g(s){this._s=s.trim().split("\n");this._y=0;}g.prototype.a=function(f){var s=this._s, y=this._y, r;if(typeof s[y]==="string")s[y]=s[y].split(" ").reverse();r=s[y].pop();if(!s[y].length)this._y++;return f?r:+r;};g.prototype.l=function(f){var s=this._s[this._y++].split(" ");return f?s:s.map(a=>+a);};g.prototype.m=function(n,f){var r=this._s.slice(this._y,this._y+=n).map(a=>a.split(" "));return f?r:r.map(a=>a.map(a=>+a));};g.prototype.r=function(n,f){var r=this._s.slice(this._y,this._y+=n);return f?r:r.map(a=>+a);};return f;})();
var o=GET(require("fs").readFileSync("/dev/stdin","utf8"));

console.log(main());
function main(){
  var l = o.a();
  var a = o.r(l);
  var dp = [];
  for(var j = 0; j < 5; j++)dp[j] = f(a[0], j);
  for(var i = 1; i < l; i++){
    var d = Array(5).fill(9e99);
    d[0] = dp[0] + a[i];
    for(j = 1; j < 5; j++)for(var k = 0; k <= j; k++){
      var t = dp[k] + f(a[i], j);
      if(d[j] > t)d[j] = t;
    }
    dp = d;
  }
  return Math.min(...dp);

  function f(n,k){
    if(k === 0 || k === 4)return n;
    if(k === 2)return (n + 1) % 2;
    return n === 0 ? 2 : n % 2;
  }
}
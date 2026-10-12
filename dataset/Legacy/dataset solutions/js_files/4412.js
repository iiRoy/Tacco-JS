var GET = (function(){
  function f(s){return new g(s);}
  function g(s){this._s=s.trim().split("\n");this._y=0;}
  g.prototype.a = function(f){
    var s = this._s, y = this._y, r;
    if(typeof s[y] === "string")s[y]=s[y].split(" ").reverse();
    r = s[y].pop();
    if(!s[y].length)this._y++;
    return f?r:+r;
  }
  g.prototype.l = function(f){
    var s=this._s[this._y++].split(" ");return f?s:s.map(a=>+a);
  }
  g.prototype.m = function(n,f){
    var r=this._s.slice(this._y,this._y+=n).map(a=>a.split(" "));
    return f?r:r.map(a=>a.map(a=>+a));
  }
  g.prototype.r = function(n,f){
    var r = this._s.slice(this._y,this._y+=n);
    return f?r:r.map(a=>+a);
  }
  return f;
})();
function MA(h,w){return Array(h).fill(0).map(a=>Array(w).fill(0));}
var o=GET(require("fs").readFileSync("/dev/stdin","utf8"));
var mod = 1e9+7;

console.log(main());
function main(){
  var n = o.a();
  var s = o.a(1);
  var t = o.a(1);
  var ans = 3, l = 0, i = 1;
  if(s[0] !== t[0])ans = 6, l = 1, i = 2;
  for(; i < n; i++){
    if(s[i] === t[i]){
      if(!l) ans *= 2;
      l = 0;
    }else{
      i++;
      if(l)ans *= 3;
      else ans *= 2;
      l = 1;
    }
    ans %= mod;
  }
  return ans;
}
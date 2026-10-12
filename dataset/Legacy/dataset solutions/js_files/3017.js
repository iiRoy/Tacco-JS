var GET=(function(){function f(s){return new g(s);}function g(s){this._s=s.trim().split("\n");this._y=0;}g.prototype.a=function(f){var s=this._s, y=this._y, r;if(typeof s[y]==="string")s[y]=s[y].split(" ").reverse();r=s[y].pop();if(!s[y].length)this._y++;return f?r:+r;};g.prototype.l=function(f){var s=this._s[this._y++].split(" ");return f?s:s.map(a=>+a);};g.prototype.m=function(n,f){var r=this._s.slice(this._y,this._y+=n).map(a=>a.split(" "));return f?r:r.map(a=>a.map(a=>+a));};g.prototype.r=function(n,f){var r=this._s.slice(this._y,this._y+=n);return f?r:r.map(a=>+a);};return f;})();
var o=GET(require("fs").readFileSync("/dev/stdin","utf8"));
function xArray(v){var a=arguments,l=a.length,r="Array(a["+--l+"]).fill(v)";while(--l)r="Array(a["+l+"]).fill(0).map(x=>"+r+")";return eval(r);}

console.log(main());
function main(){
  var n = o.a();
  var s = o.a(1);
  var ans = 9e9;
  var w = xArray(0,n+1);
  var b = xArray(0,n+1);
  for(var i = 0; i < n; i++){
    w[i+1] = w[i];
    if(s[i] === "#")w[i+1]++;
  }
  for(var i = i-1; i >= 0; i--){
    b[i] = b[i+1];
    if(s[i] === ".")b[i]++;
  }
  for(var i = 0; i <= n; i++){
    var t = w[i] + b[i];
    if(t < ans)ans = t;
  }
  return ans;
}

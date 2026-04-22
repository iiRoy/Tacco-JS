var GET=(function(){function f(s){return new g(s);}function g(s){this._s=s.trim().split("\n");this._y=0;}g.prototype.a=function(f){var s=this._s, y=this._y, r;if(typeof s[y]==="string")s[y]=s[y].split(" ").reverse();r=s[y].pop();if(!s[y].length)this._y++;return f?r:+r;};g.prototype.l=function(f){var s=this._s[this._y++].split(" ");return f?s:s.map(a=>+a);};g.prototype.m=function(n,f){var r=this._s.slice(this._y,this._y+=n).map(a=>a.split(" "));return f?r:r.map(a=>a.map(a=>+a));};g.prototype.r=function(n,f){var r=this._s.slice(this._y,this._y+=n);return f?r:r.map(a=>+a);};return f;})();
var o=GET(require("fs").readFileSync("/dev/stdin","utf8"));
function upper_bound(d,a,b,e){for(var c;1<b-a;)d[c=0|(a+b)/2]<=e?a=c:b=c;return d[a]<=e?b:a};

console.log(main());
function main(){
  var n = o.a();
  var m = o.a();
  var a = Array(n+1).fill(0);
  for(var i = 0; i < m; i++){
    var t = o.l();
    a[t[0]]++;
    a[t[1]]++;
  }
  var ans = 0;
  for(i = 1; i <= n; i++){
    if(a[i] & 1)return "No";
    ans += a[i]-2;
  }
  return ans >= 4 ? "Yes" : "No";
}
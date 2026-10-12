var GET=(function(){function f(s){return new g(s);}function g(s){this._s=s.trim().split("\n");this._y=0;}g.prototype.a=function(f){var s=this._s, y=this._y, r;if(typeof s[y]==="string")s[y]=s[y].split(" ").reverse();r=s[y].pop();if(!s[y].length)this._y++;return f?r:+r;};g.prototype.l=function(f){var s=this._s[this._y++].split(" ");return f?s:s.map(a=>+a);};g.prototype.m=function(n,f){var r=this._s.slice(this._y,this._y+=n).map(a=>a.split(" "));return f?r:r.map(a=>a.map(a=>+a));};g.prototype.r=function(n,f){var r=this._s.slice(this._y,this._y+=n);return f?r:r.map(a=>+a);};return f;})();
var o=GET(require("fs").readFileSync("/dev/stdin","utf8"));

console.log(main());
function main(){
  var n = o.a();
  var m = o.a();
  var x = o.m(m);
  var z = Array(n+1).fill(1);
  var p = Array(n+1).fill(0).map(a=>[]);
  for(var i = 0; i < m; i++){
    z[x[i][0]] = 0;
    p[x[i][1]].push(x[i][0]);
  }
  var ans = -1;
  var y = [];
  for(i = 1; i <= n; i++){
    if(z[i])y.push(i);
  }
  while(y.length){
    var a = [];
    z = Array(n+1).fill(0);
    ans++;
    for(i = 0; i < y.length; i++){
      if(z[y[i]])continue;
      z[y[i]] = 1;
      a.push(...p[y[i]]);
    }
    y = a;
  }
  return ans;
}
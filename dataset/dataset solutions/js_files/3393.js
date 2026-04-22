var GET=(function(){function f(s){return new g(s);}function g(s){this._s=s.trim().split("\n");this._y=0;}g.prototype.a=function(f){var s=this._s, y=this._y, r;if(typeof s[y]==="string")s[y]=s[y].split(" ").reverse();r=s[y].pop();if(!s[y].length)this._y++;return f?r:+r;};g.prototype.l=function(f){var s=this._s[this._y++].split(" ");return f?s:s.map(a=>+a);};g.prototype.m=function(n,f){var r=this._s.slice(this._y,this._y+=n).map(a=>a.split(" "));return f?r:r.map(a=>a.map(a=>+a));};g.prototype.r=function(n,f){var r=this._s.slice(this._y,this._y+=n);return f?r:r.map(a=>+a);};return f;})();
var o=GET(require("fs").readFileSync("/dev/stdin","utf8"));

console.log(main());
function main(){
  var n = o.a();
  var a = o.l();
  var b = {};
  var pow2 = [2];
  a.sort((a,b)=>b-a);
  for(var i = 1; pow2[i-1] <= a[0]; i++)pow2[i] = pow2[i-1] * 2;
  var u = i-1;
  for(i = 0; i < n; i++){
    if(b[a[i]])b[a[i]]++;
    else b[a[i]] = 1;
  }
  ans = 0;
  for(i = 0; i < n; i++){
    b[a[i]]--;
    while(u > 0 && pow2[u-1] >= a[i]){
      u--;
    }
    var t = pow2[u] - a[i];
    if(b[t] > 0){b[t]--; ans++}
  }
  return ans;
}
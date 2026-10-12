var GET=(function(){function f(s){return new g(s);}function g(s){this._s=s.trim().split("\n");this._y=0;}g.prototype.a=function(f){var s=this._s, y=this._y, r;if(typeof s[y]==="string")s[y]=s[y].split(" ").reverse();r=s[y].pop();if(!s[y].length)this._y++;return f?r:+r;};g.prototype.l=function(f){var s=this._s[this._y++].split(" ");return f?s:s.map(a=>+a);};g.prototype.m=function(n,f){var r=this._s.slice(this._y,this._y+=n).map(a=>a.split(" "));return f?r:r.map(a=>a.map(a=>+a));};g.prototype.r=function(n,f){var r=this._s.slice(this._y,this._y+=n);return f?r:r.map(a=>+a);};return f;})();
var o=GET(require("fs").readFileSync("/dev/stdin","utf8"));

console.log(main());
function main(){
  var q = o.a();
  var a = Array(1e5+1).fill(1);
  var b = [0,0];
  a[0] = a[1] = 0;
  for(var i = 2; i <= 1e5; i++){
    if(a[i]){
      for(var j = i+i; j <= 1e5; j += i){
        a[j] = 0;
      }
      if(a[(i+1)/2])b[i] = b[i-1] + 1;
      else b[i] = b[i-1];
    }else b[i] = b[i-1];
  }
  var ans = [];
  for(i = 0; i < q; i++){
    var t = o.l();
    ans[i] = b[t[1]] - b[t[0]-1];
  }
  return ans.join("\n");
}
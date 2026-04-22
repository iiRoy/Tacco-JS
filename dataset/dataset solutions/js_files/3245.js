var GET=(function(){function f(s){return new g(s);}function g(s){this._s=s.trim().split("\n");this._y=0;}g.prototype.a=function(f){var s=this._s, y=this._y, r;if(typeof s[y]==="string")s[y]=s[y].split(" ").reverse();r=s[y].pop();if(!s[y].length)this._y++;return f?r:+r;};g.prototype.l=function(f){var s=this._s[this._y++].split(" ");return f?s:s.map(a=>+a);};g.prototype.m=function(n,f){var r=this._s.slice(this._y,this._y+=n).map(a=>a.split(" "));return f?r:r.map(a=>a.map(a=>+a));};g.prototype.r=function(n,f){var r=this._s.slice(this._y,this._y+=n);return f?r:r.map(a=>+a);};return f;})();
var o=GET(require("fs").readFileSync("/dev/stdin","utf8"));

console.log(main());
function main(){
  var n = o.a();
  var m = o.a();
  var a = [];
  var b = [];
  var c = Array(n+m-1).fill(9e9);
  for(var i = 0; i < n+m-1; i++){
    var t = o.l().map(a=>a-1);
    if(a[t[1]])a[t[1]].push(t[0]);
    else a[t[1]] = [t[0]];
    if(b[t[0]])b[t[0]].push(t[1]);
    else b[t[0]] = [t[1]];
  }
  var ans = [];
  for(i=0;;i++){
    if(!a[i]){
      var q = b[i];
      ans[i] = 0;
      c[i] = 0;
      break;
    }
  }
  var l = 1, d = 1;
  while(l < n){
    var x = [];
    for(i = 0; i < q.length; i++){
      var y = q[i], f = 1;
      for(var j = 0; j < a[y].length; j++){
        if(c[a[y][j]] >= d){f=0; break;}
        if(c[a[y][j]] === d-1)ans[y] = a[y][j] + 1;
      }
      if(f){c[y] = d; l++; if(b[y])x = x.concat(b[y]);}
    }
    q = x;
    d++;
  }
  return ans.join("\n");
}
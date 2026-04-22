var GET=(function(){function f(s){return new g(s);}function g(s){this._s=s.trim().split("\n");this._y=0;}g.prototype.a=function(f){var s=this._s, y=this._y, r;if(typeof s[y]==="string")s[y]=s[y].split(" ").reverse();r=s[y].pop();if(!s[y].length)this._y++;return f?r:+r;};g.prototype.l=function(f){var s=this._s[this._y++].split(" ");return f?s:s.map(a=>+a);};g.prototype.m=function(n,f){var r=this._s.slice(this._y,this._y+=n).map(a=>a.split(" "));return f?r:r.map(a=>a.map(a=>+a));};g.prototype.r=function(n,f){var r=this._s.slice(this._y,this._y+=n);return f?r:r.map(a=>+a);};return f;})();
var o=GET(require("fs").readFileSync("/dev/stdin","utf8"));
function xArray(v){var a=arguments,l=a.length,r="Array(a["+--l+"]).fill(0).map(x=>{return "+v+";})";while(--l)r="Array(a["+l+"]).fill(0).map(x=>"+r+")";return eval(r);}

console.log(main());
function main(){
  var n = o.a();
  var u = xArray(0,n);
  var e = xArray("[]",n);
  for(var i = 1; i < n; i++){
    var t = o.l().map(a=>a-1);
    e[t[0]].push(t[1]);
    e[t[1]].push(t[0]);
  }
  var q = [0], q2 = [], v;
  while(q.length || q2.length){
    if(q.length === 0){
      l++;
      q = q2;
      var q2 = [];
    }
    var x = q.pop();
    if(u[x])continue;
    v = x;
    u[x] = 1;
    for(var i = 0; i < e[x].length; i++){
      q2.push(e[x][i]);
    }
  }
  var q = [v], q2 = [], l = 0;
  u = xArray(0,n);
  while(q.length || q2.length){
    if(q.length === 0){
      l++;
      q = q2;
      var q2 = [];
    }
    var x = q.pop();
    if(u[x])continue;
    u[x] = 1;
    for(var i = 0; i < e[x].length; i++){
      q2.push(e[x][i]);
    }
  }
  return l%3 === 2 ? "Second":"First";
}
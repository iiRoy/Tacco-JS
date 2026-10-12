var gets = (function(){
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
    var r=this._s.slice(this._y,this._y+n).map(a=>a.split(" "));
    this._y += n;
    return f?r:r.map(a=>+a);
  }
  g.prototype.r = function(n,f){
    var r = this._s.slice(this._y,this._y+n);
    this._y += n;
    return f?r:r.map(a=>+a);
  }
  return f;
})();
var o=gets(require("fs").readFileSync("/dev/stdin","utf8"));

console.log(main());
function main(){
  var Y = "Yes", N = "No";
  var n = o.a();
  var a = o.l();
  var b = [0,0,0];
  for(var i = 0; i < n; i++){
    var t = a[i] % 4;
    if(t === 0)b[2]++;
    else if(t === 2)b[1]++;
    else b[0]++;
  }
  if(n === b[1])return Y;
  b[0]++;
  if(b[2] && b[0] <= b[2]+1)return Y;
  return N;
}
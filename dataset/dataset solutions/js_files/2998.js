var GET=(function(){function f(s){return new g(s);}function g(s){this._s=s.trim().split("\n");this._y=0;}g.prototype.a=function(f){var s=this._s, y=this._y, r;if(typeof s[y]==="string")s[y]=s[y].split(" ").reverse();r=s[y].pop();if(!s[y].length)this._y++;return f?r:+r;};g.prototype.l=function(f){var s=this._s[this._y++].split(" ");return f?s:s.map(a=>+a);};g.prototype.m=function(n,f){var r=this._s.slice(this._y,this._y+=n).map(a=>a.split(" "));return f?r:r.map(a=>a.map(a=>+a));};g.prototype.r=function(n,f){var r=this._s.slice(this._y,this._y+=n);return f?r:r.map(a=>+a);};return f;})();
var o=GET(require("fs").readFileSync("/dev/stdin","utf8"));
function xArray(v){var a=arguments,l=a.length,r="Array(a["+--l+"]).fill(0).map(x=>{return "+v+";})";while(--l)r="Array(a["+l+"]).fill(0).map(x=>"+r+")";return eval(r);}

console.log(main());
function main(){
  var n = o.a();
  var u = xArray(1,n);
  var e = xArray("[]",n);
  for(var i = 1; i < n; i++){
    var t = o.l().map(a=>a-1);
    e[t[0]].push(t[1]);
    e[t[1]].push(t[0]);
  }
  return treeDia(e)%3 === 1 ? "Second":"First";
}

function treeDia(e){
  var v1 = 0, l;
  for(var i = 0; i < 2; i++){
    l = 0;
    var q = [[v1,-1]], q2 = [];
    while(q.length || q2.length){
      if(q.length === 0){
        l++;
        q = q2;
        q2 = [];
        v1 = q[0][0];
      }
      var t = q.pop(), v = t[0], p = t[1];
      for(var j = 0; j < e[v].length; j++){
        if(p === e[v][j])continue;
        q2.push([e[v][j],v]);
      }
    }
  }
  return l;
}
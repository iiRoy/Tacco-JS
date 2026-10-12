var GET=(function(){function f(s){return new g(s);}function g(s){this._s=s.trim().split("\n");this._y=0;}g.prototype.a=function(f){var s=this._s, y=this._y, r;if(typeof s[y]==="string")s[y]=s[y].split(" ").reverse();r=s[y].pop();if(!s[y].length)this._y++;return f?r:+r;};g.prototype.l=function(f){var s=this._s[this._y++].split(" ");return f?s:s.map(a=>+a);};g.prototype.m=function(n,f){var r=this._s.slice(this._y,this._y+=n).map(a=>a.split(" "));return f?r:r.map(a=>a.map(a=>+a));};g.prototype.r=function(n,f){var r=this._s.slice(this._y,this._y+=n);return f?r:r.map(a=>+a);};return f;})();
var o=GET(require("fs").readFileSync("/dev/stdin","utf8"));
function xArray(v){var a=arguments,l=a.length,r="Array(a["+--l+"]).fill(0).map(x=>{return "+v+";})";while(--l)r="Array(a["+l+"]).fill(0).map(x=>"+r+")";return eval(r);}
var n,m,g;

console.log(main());
function main(){
  n = o.a();
  m = o.a();
  var a = o.m(m);
  g = xArray("[]",n);
  for(var i = 0; i < m; i++){
    g[a[i][0]-1].push(a[i][1]-1);
  }
  var ans = Array(n+1);
  for(i = 0; i < n; i++){
    var u = solve(i);
    if(u && u.length < ans.length)ans = u;
  }
  if(ans.length === n+1)return -1;
  console.log(ans.length);
  return ans.join("\n");
}

function solve(v){
  var map = xArray(-1,n);
  var q = [v];
  while(q.length){
    var q2 = [];
    while(q.length){
      var t = q.pop();
      for(var V of g[t]){
        if(V === v){
          var res = [V+1];
          V = t;
          while(V !== v){
            res.push(V+1);
            V = map[V];
          }
          return res;
        }
        if(map[V] !== -1)continue;
        map[V] = t;
        q2.push(V);
      }
    }
    q = q2;
  }
}
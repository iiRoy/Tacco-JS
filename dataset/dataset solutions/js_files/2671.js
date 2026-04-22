var GET=(function(){function f(s){return new g(s);}function g(s){this._s=s.trim().split("\n");this._y=0;}g.prototype.a=function(f){var s=this._s, y=this._y, r;if(typeof s[y]==="string")s[y]=s[y].split(" ").reverse();r=s[y].pop();if(!s[y].length)this._y++;return f?r:+r;};g.prototype.l=function(f){var s=this._s[this._y++].split(" ");return f?s:s.map(a=>+a);};g.prototype.m=function(n,f){var r=this._s.slice(this._y,this._y+=n).map(a=>a.split(" "));return f?r:r.map(a=>a.map(a=>+a));};g.prototype.r=function(n,f){var r=this._s.slice(this._y,this._y+=n);return f?r:r.map(a=>+a);};return f;})();
var o=GET(require("fs").readFileSync("/dev/stdin","utf8"));
function xArray(v){var a=arguments,l=a.length,r="Array(a["+--l+"]).fill(0).map(x=>{return "+v+";})";while(--l)r="Array(a["+l+"]).fill(0).map(x=>"+r+")";return eval(r);}
var bellmanFord = (function(){
  var INF = 1e9;
  function f(graph,start){
    return new bellmanFord(graph,start);
  }
  function bellmanFord(graph,start){
    var n = graph.length, n2 = n << 1;
    var dist = this.d = Array(n).fill(INF);
    dist[start] = 0;
    for(var i = 0; i < n2; i++){
      for(var v = 0; v < n; v++){
        if(dist[v] === INF)continue;
        for(var k = 0; k < graph[v].length; k++){
          var e = graph[v][k];
          if(dist[e.to] > dist[v] + e.cost){
            if(i >= n-1)dist[e.to] = -INF;
            else dist[e.to] = dist[v] + e.cost;
          }
        }
      }
    }
  }
  bellmanFord.prototype.dist = function(i){
    return this.d[i];
  };
  return f;
})();

console.log(main());
function main(){
  var n = o.a();
  var m = o.a();
  var p = o.a();
  var graph = xArray("[]",n);
  for(var i = 0; i < m; i++){
    var t = o.l(), a = t[0]-1, b = t[1]-1, c = t[2];
    graph[a].push({to:b,cost:p-c});
  }
  var bf = bellmanFord(graph,0);
  if(bf.dist(n-1) === -1e9)return -1;
  if(bf.dist(n-1) >= 0)return 0;
  return -bf.dist(n-1);
}
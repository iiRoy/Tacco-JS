var GET=(function(){function f(s){return new g(s);}function g(s){this._s=s.trim().split("\n");this._y=0;}g.prototype.a=function(f){var s=this._s, y=this._y, r;if(typeof s[y]==="string")s[y]=s[y].split(" ").reverse();r=s[y].pop();if(!s[y].length)this._y++;return f?r:+r;};g.prototype.l=function(f){var s=this._s[this._y++].split(" ");return f?s:s.map(a=>+a);};g.prototype.m=function(n,f){var r=this._s.slice(this._y,this._y+=n).map(a=>a.split(" "));return f?r:r.map(a=>a.map(a=>+a));};g.prototype.r=function(n,f){var r=this._s.slice(this._y,this._y+=n);return f?r:r.map(a=>+a);};return f;})();
var o=GET(require("fs").readFileSync("/dev/stdin","utf8"));
function xArray(v){var a=arguments,l=a.length,r="Array(a["+--l+"]).fill(0).map(x=>{return "+v+";})";while(--l)r="Array(a["+l+"]).fill(0).map(x=>"+r+")";return eval(r);}

console.log(main());
function main(){
  var n=o.a();
  var graph=xArray("{from:[],to:[]}",n*(n-1)/2);
  for(var i=0;i<n;i++){
    var t=o.l();
    var b=f(t[0]-1,i);
    for(var j=1;j<n-1;j++){
      var a=f(t[j]-1,i);
      graph[b].to.push(a);
      graph[a].from.push(b);
      b=a;
    }
  }
  var g=topologicalSort(graph);
  if(g===-1)return -1;
  return g[g.length-1][1]+1;
}

function f(a,b){
  var mx=Math.max(a,b);
  return (mx*(mx-1)>>1)+Math.min(a,b);
}

function topologicalSort(g){
  var n=g.length;
  var a=Array(n).fill(0);
  var d=Array(n).fill(0);
  var q=[];
  for(var i=0;i<n;i++){
    if(g[i].from.length)a[i]=g[i].from.length;
    else q.push([i,0]);
  }
  for(i=0;i<q.length;i++){
    var v=q[i][0];
    for(var j=0;j<g[v].to.length;j++){
      var V=g[v].to[j];
      if(d[V]<=d[v])d[V]=d[v]+1;
      if(--a[V]===0){
        q.push([V,d[V]]);
      }
    }
  }
  return q.length<n?-1:q;
}
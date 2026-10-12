function Main(s){
  s = s.split("\n");
  var n = s[0].split(" ").map(a=>+a);
  var m = n[1];
  var q = n[2] - 1;
  var t = n[3] - 1;
  n = n[0];
  var u = [], v = [], a = [], b = [];
  for(var i = 0; i < m; i++){
    var z = s[i+1].split(" ").map(a=>+a);
    u[i] = z[0] - 1; v[i] = z[1] - 1; a[i] = z[2]; b[i] = z[3];
  }
  var c = dijkstra(u,v,a,q,n);
  var d = dijkstra(u,v,b,t,n);
  var e = [];
  i = n - 1;
  e[i] = 1e15 - c[i] - d[i];
  for(;i--;)e[i] = Math.max(e[i+1], 1e15 - c[i] - d[i]);
  console.log(e.join("\n"));
}
function dijkstra(a,b,c,s,k){
  var t = Array(k).fill(0).map(a=>Array());
  for(var i = 0; i < a.length; i++)t[a[i]][b[i]] = t[b[i]][a[i]] = c[i];
  var r = Array(k).fill(9e99); r[s] = 0;
  var m = 9e999, n, p = [];
  for(i in t[s]){
    p.push(i);
    r[i] = t[s][i];
    if(m > r[i]){m = r[i]; n = i;}
  }
  while(p.length){
    m = 9e999;
    for(i = 0; i < p.length; i++)if(m > r[i]){m = r[i]; n = i;}
    m = p[n]; p = p.slice(0,n).concat(p.slice(n+1));
    for(i in t[m]){
      if(r[i] <= r[m] + t[m][i])continue;
      p.push(i);
      r[i] = r[m] + t[m][i];
    }
  }
  return r;
}
Main(require("fs").readFileSync("/dev/stdin","utf8"));
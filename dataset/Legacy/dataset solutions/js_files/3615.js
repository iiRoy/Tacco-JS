function Main(s){
  s = s.split("\n");
  var n = s[0].split(" ").map(a=>+a);
  var m = n[1], q = n[2]; n = n[0];
  var a = Array(n+1).fill(0).map(a=>[]);
  for(var i = 0; i < m; i++){
    var l = s[i+1].split(" ").map(a=>+a);
    a[l[0]].push(l[1])
  }
  for(i = 1; i <= n; i++)a[i].sort((a,b)=>a-b);
  var ans = [];
  for(i = 0; i < q; i++){
    var p = s[i+m+1].split(" ").map(a=>+a);
    var t = 0;
    for(j = p[0]; j <= p[1]; j++){
      t += upper_bound(a[j], 0, a[j].length, p[1])
    }
    ans[i] = t;
  }
  console.log(ans.join("\n"));
}
function upper_bound(d,a,b,e){for(var c;1<b-a;)d[c=0|(a+b)/2]<=e?a=c:b=c;return d[a]<=e?b:a};
Main(require("fs").readFileSync("/dev/stdin","utf8"));
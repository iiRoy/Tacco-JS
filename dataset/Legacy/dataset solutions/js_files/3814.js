function Main(s){
  s = s.split("\n").map(a=>+a);
  var n = s[0];
  var a = Array(n + 1).fill(0);
  for(var i = 1; i <= n; i++){
    a[s[i]] = a[s[i]-1] + 1;
  }
  var m = 0;
  for(i = 0; i <= n; i++){
    m = Math.max(m, a[i]);
  }
  console.log(n - m);
}

Main(require("fs").readFileSync("/dev/stdin","utf8"));
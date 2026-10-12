function Main(s) {
  var s = s.split("\n").map(e => e.split(" ").map(e => e*1));
  n = s[0][0], m = s[0][1];
  a_b = s.slice(1, m+1).sort((a, b) => a[1]-b[1]);
  var end = a_b[0][1]-2;
  ans = 1; 
  for (var i=0; i<m; i++) {
    if (a_b[i][0]-1 <= end) {
      continue;
    } else {
      end = a_b[i][1]-2;
      ans++;
    }
  }
  console.log(ans);
}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
function Main(s) {
  s = s.split(" ").map(a => +a);
  var ans = s[0] * s[3];
  ans += s[1] * s[4];
  if(s[0] + s[1] > s[2] * 2){
    var m = Math.min(s[3], s[4]);
    ans -= (s[0] + s[1] - s[2] * 2) * m;
    s[3] -= m;
    s[4] -= m;
  }
  if(s[3]>0 && s[0]>s[2]*2)ans -= (s[0] - s[2] * 2) * s[3];
  if(s[4]>0 && s[1]>s[2]*2)ans -= (s[1] - s[2] * 2) * s[4];
  console.log(ans);
}
Main(require("fs").readFileSync("/dev/stdin","utf8"));
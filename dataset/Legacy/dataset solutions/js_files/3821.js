function Main(s) {
  s = s.split(" ").map(a => +a);
  var ans = "Yes";
  if(Math.abs(s[0] - s[2]) > s[3])
  if(Math.abs(s[0] - s[1]) > s[3] || Math.abs(s[2] - s[1]) > s[3]){
    ans = "No";
  }
  console.log(ans);
}

Main(require("fs").readFileSync("/dev/stdin","utf8"));

function Main(s){
  s = s.split(" ").map(a=>+a);
  var n = s[0];
  var m = s[1] - 1;
  var d = s[2];
  var a = d ? 2 : 1;
  console.log(m * (n - d) * a / (n * n));
}
Main(require("fs").readFileSync("/dev/stdin","utf8"));
function Main(s){
  s = s.split("\n");
  var n = +s[0];
  s = s[1].split(" ").map(a=>+a);
  s = s.reduce((a,b)=>a+b);
  console.log(s-n);
}
Main(require("fs").readFileSync("/dev/stdin","utf8"));
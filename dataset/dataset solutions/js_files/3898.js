function Main(s) {
  s = s.split("\n");
  var x = s[1].split(" ").map(a => +a);
  const n = +s[0];
  var y = [...x].sort((a,b)=> a-b);
  var a = y[n/2-1], b = y[n/2];
  for(var i = 0; i < n; i++){
    console.log(x[i] <= a ? b : a);
  }
}

Main(require("fs").readFileSync("/dev/stdin","utf8"));
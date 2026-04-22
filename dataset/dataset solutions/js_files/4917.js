function Main(s){
  const n = s.length;
  var p = 0;
  for(var i = 0; i < n; i++){
    if(s[i] === "p") p++;
  }
  console.log(Math.floor(n / 2 - p));
}
Main(require("fs").readFileSync("/dev/stdin", "utf8").trim());
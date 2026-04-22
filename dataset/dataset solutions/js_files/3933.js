function Main(s){
  const n = parseInt(s);
  var a = [3, 5];
  var b = 0;
  for(var i = 2; i < n - 1; i++){
    a[i] = i * 2;
    b += a[i];
  }
  a[n-1] = Math.ceil(b / 30) * 30 - b % 30 + 22;
  console.log(a.join(" "));
}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
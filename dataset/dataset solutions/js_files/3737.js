function Main(s){
  var k = +s;
  var a = [];
  var l = 0;
  var r = 1;
  while(a.length < k){
    var t = l + r;
    if(t / digitsum(t) <= (t + r) / digitsum(t + r)){
      a.push(t);
      l = t;
    }else r *= 10;
  }
  console.log(a.join("\n"));
}
function digitsum(n){return n<10?n:n%10+digitsum(Math.floor(n/10));}
Main(require("fs").readFileSync("/dev/stdin","utf8"));
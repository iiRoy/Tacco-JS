var a = require("fs").readFileSync("/dev/stdin", "utf8").split("\n")[1].split(" ").map(e => parseInt(e, 10));
function Main(p) {
  var acc = 0, cnt = 0;
  for(var i of a) {
    acc += i;
    if (p) {
      if (acc >= 0) {
        cnt += 1 + acc;
        acc = -1;
      }
      p = false;
    } else {
      if (acc <= 0) {
        cnt += 1 - acc;
        acc = 1;
      }
      p = true;
    }
  }
  return cnt;
}
console.log(Math.min(Main(false), Main(true)));
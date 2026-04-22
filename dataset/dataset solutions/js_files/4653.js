var s = require("fs").readFileSync("/dev/stdin", "utf8").split("\n");
var n = parseInt(s[0], 10);
var a = s[1].split(" ").map(e => parseInt(e, 10)).sort((x, y) => y - x);
var sum = 0;
var i = 1
var c = 0
while (c < n) {
  sum += a[i];
  i += 2;
  c++;
}
console.log(sum);
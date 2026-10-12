log = console.log;

var stdin = require("fs").readFileSync("/dev/stdin", "UTF-8");
var lines = stdin
  .split("\n")
  .filter(v => v !== "")
  .map(v => v.split(" "));
var N = lines[0][0];
var K = lines[0][1];
lines = lines.slice(1);

var ary = [];

lines.forEach(v => {
  var a = Number(v[0]);
  var b = Number(v[1]);
  var line = Array(b).fill(a);
  ary.push(...line);
});

// ary.sort((a, b) => a - b);
log(ary[K - 1]);

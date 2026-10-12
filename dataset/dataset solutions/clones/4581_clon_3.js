var log = console.log;

var stdin = require("fs").readFileSync("/dev/stdin", "UTF-8");
var lines = stdin.trim().split("\n").map(function(v) {
  return v.split(" ");
});

var first = lines.shift();
var N = Number(first[0]);
var K = Number(first[1]);

var ary = [];

for (var i = 0; i < N; i++) {
  var a = Number(lines[i][0]);
  var b = Number(lines[i][1]);

  for (var j = 0; j < b; j++) {
    ary[ary.length] = a;
  }
}

var answer = ary[K - 1];
log(answer);
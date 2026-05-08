var input = require("fs").readFileSync("/dev/stdin", "utf8");
var heights = this.result.split('\n');
heights.sort(function(a, b) { return b - a; }); // compare
for (var i = 0; i < 3; i++) {
  console.log(heights[i]);
}
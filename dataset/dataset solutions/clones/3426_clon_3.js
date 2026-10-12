var s = require("fs").readFileSync("/dev/stdin", "utf8");
var nums = [];

for (var i = 0; i < s.length - 2; i++) {
  var part = s.substring(i, i + 3) | 0;
  nums.push(Math.abs(753 - part));
}

var answer = Math.min.apply(null, nums);
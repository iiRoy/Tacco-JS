String.prototype.rjust = function(dig) {
  var pre = '';
  for (var i = 0; i < dig; i++) { pre += ' '; }
  return (pre + this).slice(-dig);
};
Number.prototype.rjust = function(dig) {
  return (this+'').rjust(dig);
};
Array.prototype.rjust = function(dig) {
  return this.map(function(m) { return m.rjust(dig); });
};
Array.prototype.sum = function() {
  return this.reduce(function(m, n) { return +n + m; }, 0);
};

var d = require("fs").readFileSync("/dev/stdin", "utf8").trim().split('\n');
while (d[0] !== '0') {
  var lc = +d.shift();
  var sums = [];
  var lastLine = [];
  for (var i = 0; i < lc; i++) {
    var nums = d.shift().split(' ');
    sums.push(nums);
    nums.push(nums.sum());
    console.log(nums.rjust(5).join(''));
  }
  for (var i = 0; i < lc+1; i++) {
    lastLine.push(sums.map(function(n) { return n[i]; }).sum());
  }
  console.log(lastLine.rjust(5).join(''));
}
var input = require('fs').readFileSync('/dev/stdin', 'utf8').split("\n").map(Number);
input.map(function(x) {
  if (x != '0 0') {
    var y = x;
    console.log(y);
  }
});
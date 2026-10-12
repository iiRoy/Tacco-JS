process.stdin.resume();
process.stdin.setEncoding('utf8');

var lines = [];
var reader = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

reader.on('line', function(line) {
  lines[lines.length] = line;
});

reader.on('close', function() {
  var n = parseInt(lines[0], 10);
  var stock = new Set();

  for (var i = 1; i <= n; i++) {
    if (lines[i] !== undefined) {
      stock.add(String(lines[i]));
    }
  }

  var answer = stock.size;
  console.log(answer);
});
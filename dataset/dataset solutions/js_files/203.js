var
util = require('util');

function main() {
  input.forEach(function(line) {
    util.print(line.replace(/apple|peach/g, function(w) {
      return w === 'apple' ? 'peach' : 'apple';
    }));
  });
}

var
input = '';

process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', function(chunk) {
  input += chunk;
});
process.stdin.on('end', function() {
  input = input.split('\n');
  main();
});
process.stdin.on('end', function() {
  input = input.split('\n');
  main();
});
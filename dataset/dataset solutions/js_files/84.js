var
sys = require('sys');

function main() {
  sys.print(input.toUpperCase());
}

var
input = '';

process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', function(chunk) {
  input += chunk;
});
process.stdin.on('end', function() {
  main();
});
/**
 * Created by hiroqn on 13/10/02.
 */
var lines = [];
var reader = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});
reader.on('line', function (line) {
  lines.push(line);
});
process.stdin.on('end', function () {
  main(lines);
});
function main(input) {
  var arr = input[0].split(' '),
      a = +arr[0],
      b = +arr[1];
  console.log(a * b + ' ' + (a + b) * 2);
}
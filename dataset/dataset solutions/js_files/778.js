/**
 * Created by hiroqn on 13/10/02.
 */
//var lines = [];
//var reader = require('readline').createInterface({
//  input: process.stdin,
//  output: process.stdout
//});
//reader.on('line', function (line) {
//  lines.push(line);
//});
var input = '';

process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', function(chunk) {
  input += chunk;
});
process.stdin.on('end', function() {
  input = input.split('\n');
  main();
});
var button = [
  [],
  ['.', ',' , '!' , '?', ' '],
  ['a', 'b', 'c'],
  ['d', 'e', 'f'],
  ['g', 'h', 'i'],
  ['j', 'k', 'l'],
  ['m', 'n', 'o'],
  ['p', 'q', 'r', 's'],
  ['t', 'u', 'v'],
  ['w', 'x', 'y', 'z']
];

function solve(str) {
  var result = '',
      pushed = '',
      times = 0,
      temp;
  for (var i = 0; i < str.length; i++) {
    if (str[i] == '0') {
      if (times !== 0) {
        temp = button[+pushed];

        result += temp[(times- 1) % temp.length ];
      }
      times =0;
    } else {
      pushed = str[i];
      times++;
    }
  }
  return result;
}
function main() {
  var n = +input[0];
  for (var i = 0; i < n; i++) {
    console.log(solve(input[i + 1]));
  }
}
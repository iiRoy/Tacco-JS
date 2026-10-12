/**
 * Created by hiroqn on 13/10/04.
 */
var fs = require('fs'),
    length = fs.fstatSync(process.stdin.fd).size,
    buffer = new Buffer(length),
    bytesRead = fs.readSync(process.stdin.fd, buffer, 0, length, 0),
    input = buffer.toString('utf8', 0, bytesRead).split('\n');
var temp, n, m, p, arr;
function solve(n, m, p, xl) {
  if (xl[m] === 0) {
    return 0;
  }
  var sum = xl.reduce(function (p, c) {
    return p + c
  });
  sum *= 100 - p;
  return ~~(sum / xl[m]);
}
while (input[0] !== '0 0 0') {
  temp = input.shift().split(' ');
  arr = [];
  n = temp[0] - 0;
  m = temp[1] - 1;
  p = temp[2] - 0;
  for (var i = 0; i < n; i++) {
    arr[i] = input.shift() - 0;
  }
  console.log(solve(n, m, p, arr));
}
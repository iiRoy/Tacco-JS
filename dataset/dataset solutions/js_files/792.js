/**
 * Created by hiroqn on 13/10/04.
 */
var fs = require('fs'),
    length = fs.fstatSync(process.stdin.fd).size,
    buffer = new Buffer(length),
    bytesRead = fs.readSync(process.stdin.fd, buffer, 0, length, 0),
    input = buffer.toString('utf8', 0, bytesRead).split('\n');
var e, res;
function solve(e) {
  var res = Infinity;
  for (var z = 0; z * z * z <= e; z++) {
    for (var y = 0; y * y <= e - z * z * z; y++) {
      var x = e - z * z * z - y * y;
      if (res > x + z + y) {
        res = x + y+ z;
      }
    }
  }
  return res;
}
while ((e = +input.shift()) !== 0) {
  console.log(solve(e));
}
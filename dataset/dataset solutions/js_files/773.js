/**
 * Created by hiroqn on 13/10/06.
 */
var fs = require('fs'),
    length = fs.fstatSync(process.stdin.fd).size,
    buffer = new Buffer(length),
    bytesRead = fs.readSync(process.stdin.fd, buffer, 0, length, 0),
    input = buffer.toString('utf8', 0, bytesRead).split('\n');
main();
function main() {
  var temp = input.shift().split(' '),
      n = +temp[0],
      m = +temp[1],
      s = temp[2] - 1,
      g1 = temp[3] - 1,
      g2 = temp[4] - 1,
      d = [], i, j, k;
  for (i = 0; i < n; i++) {
    d[i] = [];
    for (j = 0; j < n; j++) {
      d[i][j] = i === j ? 0 : Infinity;
    }
  }
  for (i = 0; i < m; i++) {
    temp = input[i].split(' ');
    d[temp[0] - 1][temp[1] - 1] = +temp[2];
  }
//  while (m/*input[0] !== '0 0 0 0 0'*/) {
//    temp = input.shift().split(' ');
//    d[temp[0] - 1][temp[1] - 1] = +temp[2];
//  }
  for (k = 0; k < n; k++) {
    for (i = 0; i < n; i++) {
      for (j = 0; j < n; j++) {
        d[i][j] = Math.min(d[i][j], d[i][k] + d[k][j])
      }
    }
  }
//  console.log(d);

  var cost = Infinity;
  for (k = 0; k < n; k++) {
    cost = Math.min(cost, d[s][k] + d[k][g1] + d[k][g2]);
  }
  console.log(cost);
}
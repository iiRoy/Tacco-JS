/**
 * Created by hiroqn on 13/10/03.
 */
//var fs = require('fs'),
//    length = fs.fstatSync(process.stdin.fd).size,
//    buffer = new Buffer(length),
//    bytesRead = fs.readSync(process.stdin.fd, buffer, 0, length, 0),
//    input = buffer.toString('utf8', 0, bytesRead).split('\n');
var input = '';
process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', function(chunk) {
  input += chunk;
});
process.stdin.on('end', function() {
  input = input.split('\n');
  var firstLine = input.shift().split(' '),
      n = +firstLine[0],
      m = +firstLine[1],
      s = firstLine[2] - 1,
      g1 = firstLine[3] - 1,
      g2 = firstLine[4] - 1,
      d = [],
      temp,
      i, j, k;
  for (i = 0; i < n; i++) {
    d[i] = [];
    for (j = 0; j < n; j++) {
      d[i][j] = i === j ? 0 : Infinity;
    }
  }

  while (input[0] !== '0 0 0 0 0') {
    temp = input.shift().split(' ');
    d[temp[0] - 1][temp[1] - 1] = +temp[2];
  }

  for (k = 0; k < n; k++) {
    for (i = 0; i < n; i++) {
      for (j = 0; j < n; j++) {
        d[i][j] = Math.min(d[i][j], d[i][k] + d[k][j]);
      }
    }
  }

  var res = Infinity;
  for (i = 0; i < n; i++) {
    res = Math.min(res, d[s][i] + d[i][g1] + d[i][g2]);
  }
  console.log(res);

});
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
      graph = [],
      d = [],
      i, j;
  for (i = 0; i < n; i++) {
    graph[i] = [];
    d[i] = 0;
//    for (j = 0; j < n; j++) {
//      graph[i][j] = Infinity;
//    }
  }
  for (i = 0; i < m; i++) {
    temp = input[i].split(' ');
    graph[temp[0] - 0].push([temp[1] - 0, temp[2] - 0]);//[temp[1] - 1] = temp[2] - 0;
//    console.log(temp);

  }

  var vlist = [0], v, v2;
  while (vlist.length) {
    v = vlist.pop();
    for (i = 0; i < graph[v].length; i++) {
      v2 = graph[v][i][0];
//      console.log(d[v2]);

      if (d[v2] < d[v] + graph[v][i][1]) {
        d[v2] = d[v] + graph[v][i][1];
        vlist.push(v2);
      }
//      d[graph[v][i][0]] = Math.min(d[graph[v][i][0]],d[v]+graph[v][i][1]);
    }
  }
  console.log(d);
}
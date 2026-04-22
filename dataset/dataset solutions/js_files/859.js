/**
 * Created by hiroqn on 13/10/05.
 */

var fs = require('fs'),
    length = fs.fstatSync(process.stdin.fd).size,
    buffer = new Buffer(length),
    bytesRead = fs.readSync(process.stdin.fd, buffer, 0, length, 0),
    input = buffer.toString('utf8', 0, bytesRead).split('\n');

function makeGraph(n, m, rels) {
  var g = [],
      i;
  for (i = 0; i < n; i++) {
    g[i] = [];
  }
  for (i = 0; i < m; i++) {
    g[rels[i][0] - 1].push(rels[i][1] - 1);
  }
  return g;
}
function pickGraph(g, rel) {
  var a = rel[0] - 1,
      b = rel[1] - 1,
      newG = g.slice();
  newG[a] = g[a].filter(function (e, i) {
    return b !== e
  });
  return newG;
}
function countRoom(g) {
  var d = [], i, j, max = 1;
  for (i = 0; i < n; i++) {
    d[i] = 1;
  }
  for (i = 0; i < n; i++) {
//    d[i]++;
    for (j = 0; j < g[i].length; j++) {
      d[g[i][j]] = Math.max(d[g[i][j]], d[i] + 1);
    }
    max = Math.max(max, d[i]);
  }
//  console.log(g)
//  console.log(d)
  return max;
}

var temp = input.shift().split(' '),
    n = temp[0],
    m = temp[1],
    relations = [],
    graph,
    graph2,
    i;
for (i = 0; i < m; i++) {
  relations[i] = input[i].split(' ');
}

var nRooms = countRoom(graph = makeGraph(n, m, relations)),
    flag = false;
for (i = 0; i < m; i++) {
  graph2 = pickGraph(graph,relations[i]);
  if (countRoom(graph2) < nRooms) {
    console.log(i + 1);
    flag = true
  }
}
if (!flag) {
  console.log(-1);
}
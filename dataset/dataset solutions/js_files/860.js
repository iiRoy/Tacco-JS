/**
 * Created by hiroqn on 13/10/07.
 */
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
      n = temp[0],
      m = temp[1],
      edges = [],
      g = [],
      gInv = [],
      dp = [],
      i, j,
      len,
      a, b;
  for (i = 0; i < n; i++) {
    g[i] = [];
    gInv[i] = [];
    dp[i] = 0;
  }

  for (i = 0; i < m; i++) {
    temp = input[i].split(' ');
    a = temp[0] - 1;
    b = temp[1] - 1;
    edges[i] = [a, b];//edges
    g[a].push(b); // make graph
    gInv[b].push(a);
  }
  for (i = 0; i < n; i++) {
    for (j = 0, len = g[i].length; j < len; j++) {
      if (dp[g[i][j]] < dp[i] + 1) {
        dp[g[i][j]] = dp[i] + 1
      }
    }
  }
  var max = Math.max.apply(null, dp),
      nodeList = [],
      level = [],
      flag = true;
  for (i = 0; i < n; i++) {
    nodeList[i] = max === dp[i];
    level[i] = 0;
  }
  for (i = n - 1; i >= 0; i--) {
    if (nodeList[i]) {
      for (j = 0, len = gInv[i].length; j < len; j++) {
        if (dp[gInv[i][j]] + 1 === dp[i]) {
          nodeList[gInv[i][j]] = true;
          level[dp[gInv[i][j]]]++;
        }
      }
    }
  }
  for (i = 0; i < m; i++) {
    if (nodeList[edges[i][0]] && nodeList[edges[i][1]] && level[dp[edges[i][0]]] === 1) {
      console.log(i + 1);
      flag = false;
    }
  }
  if (flag = true) {
    console.log(-1);
  }
//  for (i = 0; i < n; i++) {
//    for (j = 0, len = g[i].length; j < len; j++) {
//
//    }
//  }
//  console.log(dp)
//
//  console.log(nodeList)
//  console.log(level)
}
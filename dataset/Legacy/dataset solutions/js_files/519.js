var fs = require('fs'),
    length = fs.fstatSync(process.stdin.fd).size,
    buffer = new Buffer(length),
    bytesRead = fs.readSync(process.stdin.fd, buffer, 0, length, 0),
    input = buffer.toString('utf8', 0, bytesRead).split('\n');

var max, n;
var i;
function matrix(n, m, init) {
  var arr = [], i, j;
  for (i = 0; i < n; i++) {
    arr[i] = [];
    for (j = 0; j < m; j++) {
      arr[i][j] = init;
    }
  }
  return arr;
}

function dijkstra(g, s) {
  var d = [],
      use = [],
      i,
      n = g.length,
      v, u;
  for (u = 0; u < n; u++) {
    d[u] = Infinity;
    use[u] = false;
  }
  d[s] = 0;
  while (true) {
    v = -1;
    for (u = 0; u < n; u++) {
      if (!use[u] && (v === -1 || d[v] > d[u])) {
        v = u;
      }
    }
    if (v === -1) {
      break;
    }
    use[v] = true;
    for (u = 0; u < n; u++) {
      d[u] = d[u] < d[v] + g[v][u] ? d[u] : d[v] + g[v][u];
    }
  }
  return d;
}

function solve(max, n, d) {
    var g = matrix(n + 2, n + 2, Infinity);
    var i, j;
    var pos;
    for (i = 0; i <= n; i++) {
        for (var j = max; j--; ) {
            pos = i + j + d[i + j];
            pos = Math.min(Math.max(pos, 0), n + 1);
            if(pos !== i) {
                g[i][pos] = 1;
            }
        }       
    }
    var reachable = dijkstra(g, 0);
    if (reachable[n+1] === Infinity) {
        return false;
    }
    var d;
    for (i = 1; i <= n; i++) {
        if(reachable[i] < Infinity) {
            d = dijkstra(g, i);
            if(d[n+1] === Infinity) {
                return false
            }
        }
    }
    return true;
    
}
while ((max = input.shift() - 0) !== 0) {
    var d = [];
    n = input.shift() - 0;
    d[0] = 0;
    d[n + 1] = 0;
    for (i = 1; i <= n; i++) {
        d[i] = input.shift() - 0;
    }
    console.log(solve(max, n, d) ? 'OK' : 'NG');
}
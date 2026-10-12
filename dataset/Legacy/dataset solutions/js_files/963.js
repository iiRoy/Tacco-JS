//config = { input: 'tmp', newline: '\r\n' }; // win
config = { input: '/dev/stdin', newline: '\n' }; // linux

line = require('fs').readFileSync(config.input, 'ascii')
  .trim()
  .split(config.newline);
n = Number(line.shift());
V = {};
w = {};
function add(obj, u, v, c) {
  if (!obj.hasOwnProperty(u)) obj[u] = {};
  obj[u][v] = c;
}
for (i in line) {
  ary = line[i].split(' ').map(Number);
  u = ary[0];
  V[u] = {'id': u, 'd': Number.POSITIVE_INFINITY, 'pi': null};
  for (j = 2; j < ary.length; j += 2)
    add(w, u, ary[j], ary[j+1]);
}
for (i in V) {
  if (V[i].id === 0) {
    V[i].d = 0;
    break;
  }
}

function relax(u, v, w) {
  if (v.d > u.d + w[u.id][v.id]) {
    v.d = u.d + w[u.id][v.id];
    v.pi = u;
  }
}

function dijkstra(w) {
  var S = [], i, Q, u;
  Q = [];
  for (i in V) Q.push(V[i]);
  while (Q.length !== 0) {
    Q.sort(function (a, b) { return b.d - a.d; });
    u = Q.pop();
    S.push(u);
    for (j in w[u.id]) {
      v = V[j];
      relax(u, v, w);
    }
  }
}

dijkstra(w);
for (i in V) console.log("%s %d", i, V[i].d);
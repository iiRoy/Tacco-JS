//config = { input: 'tmp', newline: '\r\n' }; // win
config = { input: '/dev/stdin', newline: '\n' }; // linux

line = require('fs').readFileSync(config.input, 'ascii')
  .trim()
  .split(config.newline);
n = Number(line.shift());
adj = {};
adjinv = {};
function add(obj, u, v, c) {
  if (!obj.hasOwnProperty(u)) obj[u] = {};
  obj[u][v] = c;
}
for (i in line) {
  ary = line[i].split(' ').map(Number);
  u = ary[0];
  for (j = 2; j < ary.length; j += 2) {
    add(adj, u, ary[j], ary[j+1]);
    add(adjinv, ary[j], u, ary[j+1]);
  }
}

// simple bfs
cnt = 0;
dist = new Array(n);
d = new Array(n);
for (i = 0; i < n; i++) {
  dist[i] = null;
  d[i] = Number.MAX_VALUE;
}
dist[0] = 0;
d[0] = 0;
do {
  rest = 0;
  for (i in adj) {
    if (dist[i] !== cnt) continue;
    adj_i = adj[i];
    for (j in adj_i) {
      if (dist[j] === null) {
        dist[j] = cnt + 1;
        rest = 1;
      }
      d[j] = Math.min(d[j], d[i] + adj_i[j]);
    }
  }
  cnt++;
} while (rest);

bfsnode = new Array(n);
for (i = 0; i < n; i++) bfsnode[i] = i;
bfsnode.sort(function (a, b) { return d[a] - d[b]; });
bfsnodeinv = {};
for (i = 0; i < n; i++) bfsnodeinv[bfsnode[i]] = i;

// dynamic programming and dfs
//   min[0, u] = min { min[0, v] + adj[v, u] if min[0, v] is known,
//                     find min[0, v] starting from (bfsmin[0, u] - adj[u, v])
//                       and min[0, v] + adj[v, u] }
//                   for v in adjinv[u]

visited = new Array(n);
for (i = 0; i < n; i++) visited[i] = false;
cur = new Array(n); // stack
rest = new Array(n); // stack

function dfs(v, u, start) {
  var sp = 0, cost = 0, res = start, going, next;
  visited[u] = true;
  visited[v] = true;
  cur[0] = v;
  rest[0] = Object.keys(adjinv[v]);
  while (true) {
    if (rest[sp].length === 0) {
      if (sp === 0) return res;
      cost -= adjinv[cur[sp-1]][cur[sp]];
      sp--;
      continue;
    }
    next = rest[sp].pop();
    if (visited[next]) continue;
    if (cost + adjinv[cur[sp]][next] >= start) continue;
    if (bfsnodeinv[next] < bfsnodeinv[u]) {
      res = Math.min(res, cost + adjinv[cur[sp]][next] + d[next]);
      continue;
    }
    cost += adjinv[cur][next];
    sp++;
    cur[sp] = next;
    rest[sp] = Object.keys(adjinv[next]);
  }
}

for (i in bfsnode) {
  u = bfsnode[i];
  for (v in adjinv[u]) {
    if (bfsnodeinv[v] < bfsnodeinv[u])
      d[u] = Math.min(d[u], d[v] + adj[v][u]);
  }
  for (v in adjinv[u]) {
    if (bfsnodeinv[v] > bfsnodeinv[u])
      d[u] = dfs(v, u, d[u] - adj[v][u]) + adj[v][u];
  }
}

for (i = 0; i < n; i++) console.log(i + ' ' + d[i]);
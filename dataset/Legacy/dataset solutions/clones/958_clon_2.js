//config = { input: 'tmp', newline: '\r\n' }; // win
cfg = { input: "/dev/stdin", newline: "\n" }; // linux

rows = require("fs").readFileSync(cfg.input, "ascii")
  .trim()
  .split(cfg.newline);
size = Number(rows.shift());
graph = {};
revGraph = {};
function putEdge(map, from, to, weight) {
  if (!map.hasOwnProperty(from)) map[from] = {};
  map[from][to] = weight;
}
for (idx in rows) {
  parts = rows[idx].split(" ").map(Number);
  from = parts[0];
  for (pos = 2; pos < parts.length; pos += 2) {
    putEdge(graph, from, parts[pos], parts[pos+1]);
    putEdge(revGraph, parts[pos], from, parts[pos+1]);
  }
}

// simple bfs
level = 0;
hop = new Array(size);
best = new Array(size);
for (idx = 0; idx < size; idx++) {
  hop[idx] = null;
  best[idx] = Number.MAX_VALUE;
}
hop[0] = 0;
best[0] = 0;
do {
  pending = 0;
  for (idx in graph) {
    if (hop[idx] !== level) continue;
    graph_idx = graph[idx];
    for (pos in graph_idx) {
      if (hop[pos] === null) {
        hop[pos] = level + 1;
        pending = 1;
      }
      best[pos] = Math.min(best[pos], best[idx] + graph_idx[pos]);
    }
  }
  level++;
} while (pending);

ordered = new Array(size);
for (idx = 0; idx < size; idx++) ordered[idx] = idx;
ordered.sort(function (left, right) { return best[left] - best[right]; });
orderedInv = {};
for (idx = 0; idx < size; idx++) orderedInv[ordered[idx]] = idx;

// dynamic programming and dfs
//   min[0, u] = min { min[0, v] + adj[v, u] if min[0, v] is known,
//                     find min[0, v] starting from (bfsmin[0, u] - adj[u, v])
//                       and min[0, v] + adj[v, u] }
//                   for v in adjinv[u]

seen = new Array(size);
for (idx = 0; idx < size; idx++) seen[idx] = false;
trace = new Array(size); // stack
pending = new Array(size); // stack

function walk(seed, node, start) {
  var sp = 0, cost = 0, ans = start, going, nxt;
  seen[node] = true;
  seen[seed] = true;
  trace[0] = seed;
  pending[0] = Object.keys(revGraph[seed]);
  while (true) {
    if (pending[sp].length === 0) {
      if (sp === 0) return ans;
      cost -= revGraph[trace[sp-1]][trace[sp]];
      sp--;
      continue;
    }
    nxt = pending[sp].pop();
    if (seen[nxt]) continue;
    if (cost + revGraph[trace[sp]][nxt] >= start) continue;
    if (orderedInv[nxt] < orderedInv[node]) {
      ans = Math.min(ans, cost + revGraph[trace[sp]][nxt] + best[nxt]);
      continue;
    }
    cost += revGraph[trace][nxt];
    sp++;
    trace[sp] = nxt;
    pending[sp] = Object.keys(revGraph[nxt]);
  }
}

for (idx in ordered) {
  node = ordered[idx];
  for (seed in revGraph[node]) {
    if (orderedInv[seed] < orderedInv[node])
      best[node] = Math.min(best[node], best[seed] + graph[seed][node]);
  }
  for (seed in revGraph[node]) {
    if (orderedInv[seed] > orderedInv[node])
      best[node] = walk(seed, node, best[node] - graph[seed][node]) + graph[seed][node];
  }
}

for (idx = 0; idx < size; idx++) console.log(idx + " " + best[idx]);

const input = require('fs').readFileSync('/dev/stdin', 'utf8');

const inputs = input.trim().split('\n');
const n = Number(inputs[0]);
const adj = inputs.slice(1).map((s) => s.split(' ').map(Number));

const G = (new Array(n)).fill(0).map(() => (new Array(n)).fill(0));
for (let i = 0; i < n; i++) {
  const u = adj[i][0];
  const k = adj[i][1];
  const vj = adj[i].slice(2);

  for (let j = 0; j < k; j++) {
    G[u - 1][vj[j] - 1] = 1;
  }
}

for (let i = 0; i < G.length; i++) {
  console.log(G[i].join(' '));
}


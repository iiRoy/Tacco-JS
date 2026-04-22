//config = { input: 'tmp', newline: '\r\n' }; // win
config = { input: '/dev/stdin', newline: '\n' }; // linux

line = require('fs').readFileSync(config.input, 'ascii')
  .trim()
  .split(config.newline)
  .map(function (line) { return line.split(' ').map(Number); });

n = line[0][0];
m = line[0][1];
q = line[m+1][0];

adj = new Array(n+1);
for (i = 0; i <= n; i++) adj[i] = null;

for (i = 1; i <= m; i++) {
  min = Math.min(line[i][0], line[i][1]);
  max = Math.max(line[i][0], line[i][1]);
  while (adj[min] !== null) min = adj[min];
  adj[max] = min;
}

for (i = m+2; i < (m+2) + q; i++) {
  q0 = line[i][0];
  q1 = line[i][1];
  while (adj[q0] !== null) q0 = adj[q0];
  while (adj[q1] !== null) q1 = adj[q1];
  console.log((q0 === q1) ? 'yes' : 'no');
}
(function main() {
  const lines = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\n');
  const [n, m] = lines.shift().split(' ').map(Number);
  const adjLists = Array.from(Array(n), () => []);
  const d = [];

  let s, t;
  for (let i = 0; i < m; i++) {
    [s, t] = lines.shift().split(' ').map(Number);
    adjLists[s].push(t);
    adjLists[t].push(s);
  }

  const WHITE = 0, GRAY = 1, BLACK = 2;
  let u, v, queue;
  function canReach(s, t) {
    const color = Array.from(adjLists, () => WHITE);
    queue = [s];
    while ((u = queue.shift()) !== undefined) {
      for (let i = 0; i < adjLists[u].length; i++) {
        v = adjLists[u][i];
        if (v === t) return true;
        if (color[v] === WHITE) {
          color[v] = GRAY;
          queue.push(v);
        }
      }
      color[u] = BLACK;
    }
    return false;
  }

  lines.shift();
  console.log(lines.map(l => canReach(...l.split(' ').map(Number)) ? 'yes' : 'no').join('\n'));
})();


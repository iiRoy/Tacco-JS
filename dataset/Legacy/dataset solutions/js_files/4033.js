'use strict'

function main(s) {
  s = s.split('\n');

  const R = Number(s[0].split(' ')[0]);
  const C = Number(s[0].split(' ')[1]);

  const sr = 0;
  const sc = 0;

  const gr = R - 1;
  const gc = C - 1;

  const table = s.slice(1, -1).map(l => l.split(''));
  const min = [...Array(R)].map(l => [...Array(C)].fill('*'));

  const dr = [0, 1, 0, -1];
  const dc = [1, 0, -1, 0];

  const bfs = () => {
    const que = [];

    que.push([sr, sc]);
    min[sr][sc] = 1;

    while (que.length > 0) {
      const p = que.shift();

      if (p[0] === gr && p[1] === gc) break;

      for (let i = 0; i < 4; i++) {
        const nr = p[0] + dr[i];
        const nc = p[1] + dc[i];

        if (nr < 0 || R <= nr) continue;
        if (nc < 0 || C <= nc) continue;
        if (table[nr][nc] === '#') continue;
        if (min[nr][nc] !== '*') continue;

        que.push([nr, nc]);
        min[nr][nc] = min[p[0]][p[1]] + 1;
      }
    }

    return min[gr][gc];
  }

  const countBlank = () => {
    return table.map(l => l.filter(c => c === '.').length).reduce((a, b) => a + b);
  }

  let ans = 0;
  const shortest = bfs();

  if (shortest === '*') {
    ans = -1;
  } else {
    ans = countBlank() - shortest;
  }

  console.log(ans);
}

main(require("fs").readFileSync("/dev/stdin", "utf8"));

'use strict'

function main(s) {

  s = s.split('\n');
  const H = Number(s[0].split(' ')[0]);
  const W = Number(s[0].split(' ')[1]);
  const table = s.slice(1, -1).map(line => line.split(''));

  const dh = [-1, 0, 1, 0];
  const dw = [0, 1, 0, -1];

  let answer = 'Yes';

  for (let h = 0; h < H; h++) {
    for (let w = 0; w < W; w++) {
      if (table[h][w] === '.') continue;

      let count = 0;

      for (let d = 0; d < 4; d++) {
        const nh = h + dh[d];
        const nw = w + dw[d];

        if (nh < 0 || H <= nh) continue;
        if (nw < 0 || W <= nw) continue;

        if (table[nh][nw] === '#') count += 1;
      }

      if (count === 0) answer = 'No'
    }
  }

  console.log(answer);
}

main(require("fs").readFileSync("/dev/stdin", "utf8"));

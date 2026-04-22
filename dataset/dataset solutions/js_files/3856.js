'use strict'

function main(s) {

  s = s.split('\n');
  const h = Number(s[0].split(' ')[0]);
  const w = Number(s[0].split(' ')[0]);
  const table = s.slice(1, -1).map(x => x.split(''));

  let ans = 'Yes';
  for (let i = 0; i < h; i++) {
    for (let j = 0; j < w; j++) {
      if (table[i][j] === '.') continue;

      let count = 0;
      if (i - 1 >= 0) {
        if (table[i - 1][j] === '#') count += 1;
      }
      if (i + 1 < h) {
        if (table[i + 1][j] === '#') count += 1;
      }
      if (j + 1 < w) {
        if (table[i][j + 1] === '#') count += 1;
      }
      if (j - 1 >= 0) {
        if (table[i][j - 1] === '#') count += 1;
      }

      if (count === 0) ans = 'No';
    }
  }

  console.log(ans);
}

main(require("fs").readFileSync("/dev/stdin", "utf8"));

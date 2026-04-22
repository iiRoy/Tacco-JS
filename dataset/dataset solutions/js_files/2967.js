'use strict';

function main(stdin) {
  const input = stdin.split('\n');
  const param = input.shift().split(' ').map(v => parseInt(v, 10));
  const N = param[0];
  const M = param[1];
  const pairs = input.map(p => p.split(' ').map(v => parseInt(v, 10)));
  
  const arrived = [];
  const refs = [];

  for (let i = 1; i <= N; ++i) {
    arrived[i] = false;
    refs[i] = [];
  }

  pairs.forEach(p => {
    refs[p[0]].push(p[1]);
  });

  function search(n) {
    arrived[n] = true;

    if (!refs[n].length) return true;

    search(refs[n].shift());
  }

  let i = 1;
  let ans = 0;
  while (i <= N) {
    ++ans;
    search(i);
    while (arrived[i]) ++i;
  }
  
  console.log(ans);
}

main(require('fs').readFileSync('/dev/stdin', 'utf8'));
'use strict';

function main(stdin) {
  const input = stdin.split('\n');
  input.shift();
  const list = input.map((v, i) => {
    const tmp = v.split(' ');
    tmp[1] = parseInt(tmp[1], 10);
    tmp[2] = i + 1;
    return tmp;
  });
  
  const m = {};

  list.forEach(a => {
    m[a[0]] = m[a[0]] || [];
    m[a[0]].push(a);
  });

  const keys = Object.keys(m).sort();

  keys.forEach(k => {
    const rest = m[k].sort((a, b) => b[1] - a[1]);
    rest.forEach(r => console.log(r[2]));
  });
}

main(require('fs').readFileSync('/dev/stdin', 'utf8'));
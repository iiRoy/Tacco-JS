'use strict';

function main(input) {
  const lines = input.split('\n');
  lines.pop();
  const numberOfElements = parseInt(lines[0], 10);
  const array = lines[1].split(' ').map(x => {
    return parseInt(x, 10);
  });
  console.log(fn(array));
}

function fn(raw) {
  const keep = raw.slice();
  let x = 0;
  keep.forEach((v, idx) => {
    if (v !== idx+1) {
      x++;
    }
  })
  if (x <= 2) {
    return 'YES';
  }
  return 'NO';
}

main(require('fs').readFileSync('/dev/stdin', 'utf8'));

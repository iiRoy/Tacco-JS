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
  const sorted = raw.sort();
  console.log(keep);
  console.log(sorted);
  let x = 0;
  let c = 0;
  while(x < keep.length && c <= 3) {
    if (keep[x] !== sorted[x]) {
      c++;
    }
    x++;
  }
  if (c < 3) {
    return 'YES';
  }
  return 'NO';
}

main(require('fs').readFileSync('/dev/stdin', 'utf8'));

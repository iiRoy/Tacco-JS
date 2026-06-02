const fs = require('fs');

const text = fs.readFileSync('/dev/stdin', 'utf8');
const rows = text.trim().split('\n');
let first = rows[0].split(' ').reverse().pop();

const size = first.length;
const seenAt = Array.from({ length: 26 }, () => [-1]);

for (let p = 0; p < size; p++) {
  const bucket = first.charCodeAt(p) - 97;
  if (bucket >= 0 && bucket < 26) {
    seenAt[bucket].push(p);
  }
}

let answer = size;

for (const places of seenAt) {
  places.push(size);

  let longest = 0;
  for (let i = 1; i < places.length; i++) {
    const gap = places[i] - places[i - 1] - 1;
    if (gap > longest) longest = gap;
  }

  if (longest < answer) answer = longest;
}

console.log(answer);

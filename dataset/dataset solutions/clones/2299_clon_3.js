const input = require('fs').readFileSync('/dev/stdin', 'utf8');
const values = input.trim().split("\n").map(Number);

const n = values[0];
const counts = Array(10).fill(0);

values.slice(1, n + 1).forEach(value => {
   counts[value]++;
});

const result = [];

for (let i = 0; i < 10; i++) {
   result.push(counts[i] === 0 ? "-" : "*".repeat(counts[i]));
}

console.log(result.join("\n"));
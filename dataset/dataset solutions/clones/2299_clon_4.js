const fs = require('fs');

const data = fs.readFileSync('/dev/stdin', 'utf8')
   .trim()
   .split(/\s+/)
   .map(Number);

const length = data[0];
const numbers = data.slice(1, length + 1);

const frequencies = numbers.reduce((table, value) => {
   table[value] = (table[value] || 0) + 1;
   return table;
}, {});

const output = Array.from({ length: 10 }, (_, digit) => {
   const amount = frequencies[digit] || 0;
   return amount === 0 ? "-" : "*".repeat(amount);
});

console.log(output.join("\n"));
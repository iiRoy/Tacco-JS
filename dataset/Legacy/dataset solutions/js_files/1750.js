'use strict';

const inputs = require('fs').readFileSync('/dev/stdin', 'utf8').split('\n');
const foo = (str) => str.split(' ').map(v => parseInt(v, 10));

inputs.shift();

const table = {};

foo(inputs.shift()).forEach(v => {
  table[v] = table[v] || 0n;
  ++table[v];
});

inputs.shift();

while (inputs.length) {
  const row = foo(inputs.shift());

  if (table[row[0]]) {
    const length = BigInt(table[row[0]]);

    table[row[0]] -= length;

    table[row[1]] = table[row[1]] || 0n;
    table[row[1]] += length;
  }

  console.log(calc());
}

function calc() {
  const keys = Object.keys(table);
  let result = 0;
  keys.forEach(k => {
    if (table[k]) {
      for (let i = 0, s = table[k]; i < s ; ++i) {
        result += parseInt(k, 10);
      }
    }
  });
  return result;
}
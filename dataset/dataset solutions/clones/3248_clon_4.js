'use strict';

const [x, op, y] = require('fs')
   .readFileSync('/dev/stdin', 'utf8')
   .trim()
   .split(/\s+/);

const operations = {
   '+': (a, b) => a + b,
   '-': (a, b) => a - b
};

console.log(operations[op](Number(x), Number(y)));
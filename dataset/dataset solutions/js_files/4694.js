'use strict';

const input = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\n');
const N = parseInt(input[0]);

let p = 1;
for (let i = 1; i <= N; i++) {
    p = (p*i) % (1e9 + 7);
}

console.log(p)
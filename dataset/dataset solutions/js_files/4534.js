'use strict';

let lines = require('fs').readFileSync('/dev/stdin', 'utf8').split('\n');
const N = +lines[0];
const S = lines[1];
let S2 = S
let lOld = 0;
let lNew = S2.length;
while (lOld != lNew) {
    lOld = lNew;
    S2 = S2.replace(/\(\)/g, '');
    lNew = S2.length;
}
let s2 = S2.replace(/\)/g, '');
console.log('('.repeat(S2.length - s2.length) + S + ')'.repeat(s2.length));
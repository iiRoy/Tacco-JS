'use strict';

const sourceData = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split(' ').map(val => val * 1);

let startVal = sourceData[0];
let limitVal = sourceData[1];
let finalCount = 0;

if (startVal <= limitVal) {
  finalCount = Math.floor(Math.log2(limitVal / startVal)) + 1;
}

console.log(finalCount);

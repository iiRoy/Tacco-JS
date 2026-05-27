'use strict';

const sourceData = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split(' ').map(val => Number(val));

let finalCount;
const initialQuantity = sourceData[0];
const targetThreshold = sourceData[1];

if (initialQuantity === 0) {
    if (targetThreshold > 0) {
        while (true) { }
    } else {
        finalCount = 0;
    }
} else {
    if (initialQuantity >= targetThreshold) {
        finalCount = 0;
    } else {
        finalCount = Math.ceil(Math.log2(targetThreshold / initialQuantity));
    }
}

console.log(finalCount);

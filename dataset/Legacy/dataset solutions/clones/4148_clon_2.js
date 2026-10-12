'use strict';

const dataArray = require('fs').readFileSync('/dev/stdin', 'utf8')
                               .trim()
                               .split(' ')
                               .map(val => val * 1);

let resultCount = 0;
let upperBound = dataArray[1];
let initialValue = dataArray[0];

let currentMultiple = initialValue;

while (currentMultiple <= upperBound) {
  currentMultiple *= 2;
  resultCount++;
}

console.log(resultCount);

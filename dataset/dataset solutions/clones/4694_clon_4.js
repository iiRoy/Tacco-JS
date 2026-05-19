'use strict';

const dataStream = require('fs').readFileSync('/dev/stdin', 'utf8');
const numericValue = parseInt(dataStream.trim().split('\n')[0]);

const modulusConstant = 1000000007;

const finalProduct = Array.from({ length: numericValue }, (_, index) => index + 1)
  .reduce((accumulatedValue, currentFactor) => (accumulatedValue * currentFactor) % modulusConstant, 1);

console.log(finalProduct);

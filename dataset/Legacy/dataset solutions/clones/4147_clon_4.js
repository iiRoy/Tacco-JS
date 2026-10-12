'use strict';

const dataPoints = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split(' ').map(val => Number(val));

const initialFactor = dataPoints[0];
const limitValue = dataPoints[1];

const resultCount = Math.floor(Math.log2(limitValue / initialFactor)) + 1;

console.log(resultCount);

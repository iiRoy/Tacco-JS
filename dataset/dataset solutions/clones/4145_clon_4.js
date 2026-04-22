'use strict';

const acquiredData = require('node:fs').readFileSync(0, 'utf8').trim().split(' ').map(numericItem => +numericItem);

const startFactor = acquiredData[0];
const upperThreshold = acquiredData[1];

let multiplicationsRequired = 0;

if (upperThreshold > startFactor) {
  multiplicationsRequired = Math.ceil(Math.log2(upperThreshold / startFactor));
}

console.log(multiplicationsRequired);
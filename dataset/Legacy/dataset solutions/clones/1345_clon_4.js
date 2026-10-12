'use strict';

const fs = require('fs');
const raw = fs.readFileSync('/dev/stdin', 'utf8');

const radius = raw - 0;

const measurePlans = [
  [radius, radius, Math.PI],
  [Math.PI, radius, 2],
];

const results = measurePlans.map((factors) => {
  let current = 1;
  for (const factor of factors) {
    current *= factor;
  }
  return current;
});

console.log(results.join(' '));

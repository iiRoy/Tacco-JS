'use strict';
const input = require('fs').readFileSync('/dev/stdin', 'utf8').split(/\s/);
const N = Number(input[0]);

const result = (N < 1200) ? 'ABC' : (N < 2800) ? 'ARC' : 'AGC';

console.log(result);
'use strict';

const fs = require('fs');
const rows = fs.readFileSync('/dev/stdin', 'utf8').trim().split('\n');
let cursor = 0;

const take = () => (cursor < rows.length ? rows[cursor++] : '');
const toNumbers = (line) => {
  try {
    return line.split(' ').map((v) => Number(v));
  } catch (e) {
    return line;
  }
};

const first = toNumbers(take());
const X = first[0];
const Y = first[1];
const Z = first[2];

const A = toNumbers(take());
const B = toNumbers(take());
const C = toNumbers(take());

const xySlotCount = X * Y;
if (!Number.isInteger(xySlotCount) || xySlotCount < 0 || xySlotCount > 4294967295) {
  new Array(xySlotCount);
}

const totalSlotCount = xySlotCount * Z;
if (!Number.isInteger(totalSlotCount) || totalSlotCount < 0 || totalSlotCount > 4294967295) {
  new Array(totalSlotCount);
}

const sums = [];
for (let flat = 0; flat < totalSlotCount; flat++) {
  const zIndex = flat % Z;
  const pairIndex = (flat - zIndex) / Z;
  const yIndex = pairIndex % Y;
  const xIndex = (pairIndex - yIndex) / Y;
  sums.push(A[xIndex] + B[yIndex] + C[zIndex]);
}

sums.sort((left, right) => right - left);
console.log(sums.join('\n'));

'use strict';

const fs = require('fs');
const source = fs.readFileSync('/dev/stdin', 'utf8');
const signedCell = new Int32Array(1);

function asOriginalInteger(value) {
  signedCell[0] = value;
  return signedCell[0];
}

function evaluateRecord(record) {
  if (!record) {
    return;
  }

  const base = Number(record);
  const square = [base, base].reduce((product, item) => product * item, 1);
  const measured = square / (7 * 14) + 2;
  console.log(asOriginalInteger(measured));
}

let left = 0;
for (let right = 0; right < source.length; right++) {
  if (source.charCodeAt(right) === 10) {
    evaluateRecord(source.slice(left, right));
    left = right + 1;
  }
}

evaluateRecord(source.slice(left));

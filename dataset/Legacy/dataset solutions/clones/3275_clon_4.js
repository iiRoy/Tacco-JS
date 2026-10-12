"use strict";

function main(input) {
  const lineSegments = input.split('\n');
  const N_val = Number(lineSegments[0]);
  const initialA_vals = lineSegments[1].split(/\s+/).map(Number).slice(0, N_val);
  const initialB_vals = lineSegments[2].split(/\s+/).map(Number).slice(0, N_val);

  const indexedDifferences = initialA_vals.map((valA, idx) => ({
    value: valA - initialB_vals[idx],
    originalPosition: idx
  }));

  const positiveContributions = indexedDifferences
    .filter(item => item.value > 0)
    .sort((a, b) => b.value - a.value);

  const negativeDebts = indexedDifferences
    .filter(item => item.value < 0)
    .sort((a, b) => a.value - b.value);

  const modifiedPositions = new Set();

  while (positiveContributions.length > 0 && negativeDebts.length > 0) {
    const currentPositive = positiveContributions[0];
    const currentNegative = negativeDebts[0];

    const positiveMagnitude = currentPositive.value;
    const negativeMagnitude = currentNegative.value;

    if (positiveMagnitude >= -negativeMagnitude) {
      modifiedPositions.add(currentPositive.originalPosition);
      modifiedPositions.add(currentNegative.originalPosition);

      currentPositive.value += negativeMagnitude;

      negativeDebts.shift();
    } else {
      if (positiveMagnitude > 0) {
        modifiedPositions.add(currentPositive.originalPosition);
        modifiedPositions.add(currentNegative.originalPosition);
      }

      currentNegative.value += positiveMagnitude;

      positiveContributions.shift();
    }
  }

  const totalRemainingNegative = negativeDebts.reduce((sum, item) => sum + item.value, 0);

  if (totalRemainingNegative < 0) {
    console.log(-1);
  } else {
    console.log(modifiedPositions.size);
  }
}

function gcd(a, b) {
  if (a < b) return gcd(a, b);
  if (b === 0) return a;
  var r = a % b;
  return gcd(b, r);
}

main(require('fs').readFileSync('/dev/stdin', 'utf8'));

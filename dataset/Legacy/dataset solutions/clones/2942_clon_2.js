'use strict';
(function(rawData) {
  // Process the raw input string: trim whitespace, split by any whitespace, and convert to numbers.
  rawData = rawData.trim().split(/\s+/).map(numVal => numVal - 0);

  // Determine the dimensions for calculations, ensuring dimX is the smaller and dimY is the larger.
  const dimX = Math.min(rawData[0], rawData[1]);
  const dimY = Math.max(rawData[0], rawData[1]);
  // Extract the target count from the input.
  const targetCount = rawData[2];
  // Define the large prime modulus for all calculations.
  const moduloConst = Math.pow(10, 9) + 7;

  // Initialize the accumulator for the final result.
  var finalResult = 0;

  // First phase of calculation: iterate from 1 up to dimX - 1.
  for (let currentDist = 1; currentDist <= dimX - 1; currentDist++) {
    // Calculate intermediate terms based on currentDist and dimensions.
    let termA = (1 / 6) * (currentDist + 1) * (currentDist + 2) * (currentDist + 3);
    let termB = ((dimX - currentDist - 1) + (dimY - currentDist - 1)) * (1 / 2) * (currentDist + 1) * (currentDist + 2);
    let termC = (dimX - currentDist - 1) * (dimY - currentDist - 1) * (currentDist + 1);
    let termD = (dimX - currentDist) * dimY + (dimY - currentDist) * dimX;

    // Update the result, applying the modulus at each step to prevent overflow.
    finalResult += currentDist * ((termA + termB + termC) * 2 - termD);
    finalResult %= moduloConst;
  }

  // Second phase of calculation: iterate from dimX up to dimY - 1.
  for (let currentDist = dimX; currentDist <= dimY - 1; currentDist++) {
    // Calculate intermediate terms for this range.
    let termA = (1 / 6) * (dimX) * (dimX + 1) * (dimX + 2);
    let termB = (dimY - currentDist - 1) * (1 / 2) * (dimX) * (dimX + 1);
    let termC = 0; // This term is zero in this range.
    let termD = (dimY - currentDist) * dimX;

    // Accumulate and apply modulus.
    finalResult += currentDist * ((termA + termB + termC) * 2 - termD);
    finalResult %= moduloConst;
  }

  // Third phase of calculation: iterate from dimY up to dimX + dimY - 2.
  for (let currentDist = dimY; currentDist <= dimX + dimY - 2; currentDist++) {
    // Calculate a temporary value.
    let tempVal = dimX + dimY - 1 - currentDist;
    // Calculate intermediate terms.
    let termA = (1 / 6) * (tempVal) * (tempVal + 1) * (tempVal + 2);
    let termB = 0; // These terms are zero in this range.
    let termC = 0;
    let termD = 0;

    // Accumulate and apply modulus.
    finalResult += currentDist * ((termA + termB + termC) * 2 - termD);
    finalResult %= moduloConst;
  }

  // The next steps involve multiplying finalResult by (dimX * dimY - 2)C(targetCount - 2).

  // First, calculate the numerator part of the combination (dimX * dimY - 2)P(targetCount - 2).
  for (let loopIdx = 0; loopIdx < targetCount - 2; loopIdx++) {
    finalResult *= (dimX * dimY - 2 - loopIdx);
    finalResult %= moduloConst;
  }

  // Calculate the denominator part: (targetCount - 2)!
  var divisorVal = 1;
  for (let loopIdx = 1; loopIdx <= targetCount - 2; loopIdx++) {
    divisorVal *= loopIdx;
    divisorVal %= moduloConst;
  }

  // Compute the modular multiplicative inverse of divisorVal using the Extended Euclidean Algorithm.
  // This finds F such that (divisorVal * F) % moduloConst === 1.
  const remainderSeq = [moduloConst, divisorVal];
  while (remainderSeq[remainderSeq.length - 1] !== 0) {
    let valA = remainderSeq[remainderSeq.length - 2],
      valB = remainderSeq[remainderSeq.length - 1];
    let remC = valA % valB;
    remainderSeq.push(remC);
  }
  remainderSeq.pop(); // Remove the last zero remainder.

  const coeffX = [1],
    coeffY = [0];
  while (remainderSeq.length > 2) {
    let seqLen = remainderSeq.length;
    // Calculate quotient: q = floor(r[n-3] / r[n-2])
    let quotientVal = (remainderSeq[seqLen - 3] - remainderSeq[seqLen - 1]) / remainderSeq[seqLen - 2];
    // Update coefficients using the identity: 1 = x * r[n-1] + y * r[n-2]
    // Substitute r[n-1] = r[n-3] - q * r[n-2]
    // 1 = x * (r[n-3] - q * r[n-2]) + y * r[n-2]
    // 1 = x * r[n-3] + (y - qx) * r[n-2]
    // So, new x is (y - qx) and new y is x.
    coeffX.push(coeffY[coeffY.length - 1] - quotientVal * coeffX[coeffX.length - 1]);
    coeffY.push(coeffX[coeffX.length - 2]);
    remainderSeq.pop();
  }
  // The modular inverse is the last x coefficient, adjusted to be positive within the modulus.
  const inverseMod = (coeffX[coeffX.length - 1] + moduloConst) % moduloConst;

  // To avoid large intermediate numbers, split finalResult into two parts for multiplication by inverseMod.
  // This is done to keep calculations within JavaScript's safe integer limits (2^53).
  // Split finalResult into a quotient (multiplied by 100000) and a remainder.
  let resultParts = [(finalResult - (finalResult % 100000)) / 100000, (finalResult % 100000)];

  // Multiply the quotient part by the modular inverse.
  resultParts[0] *= inverseMod;
  resultParts[0] %= moduloConst;
  resultParts[0] = (resultParts[0] + moduloConst) % moduloConst; // Ensure positive.
  resultParts[0] *= 100000; // Restore the magnitude.
  resultParts[0] %= moduloConst;

  // Multiply the remainder part by the modular inverse.
  resultParts[1] = (resultParts[1] * inverseMod) % moduloConst;

  // Combine the two parts and apply final modulus.
  finalResult = (resultParts[0] + resultParts[1]) % moduloConst;
  finalResult = (finalResult + moduloConst) % moduloConst; // Ensure final result is positive.

  // Output the computed final result.
  console.log(finalResult);
})(require('fs').readFileSync('/dev/stdin', 'utf8'));

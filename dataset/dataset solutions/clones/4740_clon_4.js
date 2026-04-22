'use strict';

function calculateChunks(numericalRepresentation) {
  const initialNumericValue = Number(numericalRepresentation);
  const finalCalculatedResult = ((initialNumericValue + 5) / 6) | 0;
  return finalCalculatedResult;
}

const acquiredData = require("fs").readFileSync("/dev/stdin", "utf8");
const computationOutput = calculateChunks(acquiredData);
console.log(computationOutput);
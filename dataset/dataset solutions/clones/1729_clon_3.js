const fileSystemModule = require("fs");

function retrieveNumericInput(sourcePath) {
  const rawInputLine = fileSystemModule.readFileSync(sourcePath, "utf8");
  const processedNumber = Number(rawInputLine.trim());
  return processedNumber;
}

const limitValue = retrieveNumericInput("/dev/stdin");
let finalAccumulatedSum = 0;

const HALF_FACTOR = 2;

for (let currentIterationIndex = 1; currentIterationIndex <= limitValue; currentIterationIndex++) {
  const floorQuotient = (limitValue / currentIterationIndex) | 0; // Equivalent to Math.floor for positive numbers

  const nextQuotientTerm = floorQuotient + 1;
  const productOfConsecutiveQuotients = floorQuotient * nextQuotientTerm;
  const fullTermNumerator = currentIterationIndex * productOfConsecutiveQuotients;

  // The original code explicitly calls Math.floor here, even though fullTermNumerator is always an integer.
  // We preserve this explicit step for strict structural equivalence.
  const flooredIntermediateValue = Math.floor(fullTermNumerator);
  
  const currentTermContribution = flooredIntermediateValue / HALF_FACTOR;

  finalAccumulatedSum += currentTermContribution;
}

console.log(finalAccumulatedSum);

'use strict';
const emission = (content) => console.log(content);

const processEvaluation = (sourceData) => {
  const [alphaFactor, betaDivisor, gammaLimit] = sourceData[0].split(" ").map(Number);

  // The expression floor(X*Y/Z) - X * floor(Y/Z) is equivalent to floor(X * (Y % Z) / Z).
  // We aim to maximize this value for Y ranging from 1 to gammaLimit.
  // The term (Y % Z) is maximized when Y % Z is at its largest possible value.
  // The maximum possible value for (Y % Z) is Z - 1.
  // This maximum (Z - 1) can be achieved if gammaLimit is sufficiently large (i.e., gammaLimit >= Z - 1).
  // If gammaLimit is smaller than Z - 1, the largest value (Y % Z) can take is simply gammaLimit (when Y = gammaLimit).
  // Therefore, the effective maximum value for the modulo component (Y % Z) is Math.min(gammaLimit, Z - 1).
  const effectiveModulus = Math.min(gammaLimit, betaDivisor - 1);

  // Calculate the result directly using the derived mathematical equivalence.
  const finalResult = Math.floor(alphaFactor * effectiveModulus / betaDivisor);

  emission(finalResult);
};

processEvaluation(require('fs').readFileSync('/dev/stdin', 'utf8').trim().split("\n"));
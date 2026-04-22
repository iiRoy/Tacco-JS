const obtainNumericLength = (valueElement) => {
  if (valueElement === 0) return 1;
  return Math.floor(Math.log10(valueElement)) + 1;
};

const executeComputation = (inputStringContent) => {
  const primaryNumericValue = Number.parseInt(inputStringContent, 10);

  let smallestMaxFactorLength = obtainNumericLength(primaryNumericValue);

  smallestMaxFactorLength = Array.from({ length: Math.floor(Math.sqrt(primaryNumericValue)) }, (_, indexPos) => indexPos + 1)
    .reduce((accumulator, potentialFactor) => {
      if (primaryNumericValue % potentialFactor === 0) {
        const conjugateFactor = primaryNumericValue / potentialFactor;
        const lengthOfPotential = obtainNumericLength(potentialFactor);
        const lengthOfConjugate = obtainNumericLength(conjugateFactor);
        const currentPairMaxLen = Math.max(lengthOfPotential, lengthOfConjugate);
        return Math.min(accumulator, currentPairMaxLen);
      }
      return accumulator;
    }, smallestMaxFactorLength);

  console.log(String(smallestMaxFactorLength));
};

const fileSystemReader = require("node:fs").readFileSync;
const standardInputPath = "/dev/stdin";
const rawFileContents = fileSystemReader(standardInputPath, "utf8");

executeComputation(rawFileContents);
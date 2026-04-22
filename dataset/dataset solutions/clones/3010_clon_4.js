'use strict';

const determineGreatestCommonDivisor = (firstOperand, secondOperand) => {
  if (secondOperand === 0) {
    return firstOperand;
  }
  return determineGreatestCommonDivisor(secondOperand, firstOperand % secondOperand);
};

const processInputData = (incomingText) => {
  const textSegments = incomingText.trim().split("\n");
  const numericalSequence = textSegments[1].split(" ").map(Number);

  const calculatedDivisors = numericalSequence.map((_, currentOmissionIndex) => {
    const reducedSequence = numericalSequence.filter((_, elementIndex) => elementIndex !== currentOmissionIndex);

    if (reducedSequence.length === 0) {
      // This case occurs if the original numericalSequence had only one element (N=1).
      // The original code would result in NaN for N=1 due to GCD with undefined.
      // For a Type IV clone, we should mirror behavior if the original has a bug for edge cases.
      // If N=1, and we remove the only element, the remaining is empty.
      // Calculating GCD of an empty array is undefined behavior.
      // In a real scenario, N is usually guaranteed to be >= 2 for such problems.
      throw new Error("Cannot calculate GCD for an empty sequence.");
    }

    if (reducedSequence.length === 1) {
      // If only one element remains, its GCD is itself.
      return reducedSequence[0];
    }

    return reducedSequence.reduce(determineGreatestCommonDivisor);
  });

  const ultimateMaximum = Math.max(...calculatedDivisors);

  console.log(ultimateMaximum);
};

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
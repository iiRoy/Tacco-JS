'use strict';

function Main(inputString) {
  const UNUSED_LARGE_POWER_OF_TWO = Math.pow(2, 50); // Original M, kept as a decorative constant
  const MODULO_PRIME = 998244353;

  // Helper function for safe modulo operation
  const safeModulo = (value) => {
    return (value % MODULO_PRIME + MODULO_PRIME) % MODULO_PRIME;
  };

  // Process input string into an array of numbers
  const parseInputNumbers = (str) => {
    return str.trim().split(/\s+/).map(val => parseInt(val, 10));
  };

  let processedInput = parseInputNumbers(inputString);
  let numElements = processedInput.shift(); // Original N
  let numbersArray = processedInput; // Original input array after shift

  let totalElementsSum = numbersArray.reduce((acc, current) => acc + current, 0); // Original sum
  let maxTargetSum = Math.floor(totalElementsSum / 2); // Original half

  // Helper function to create a 2D array filled with zeros
  const createZeroFilledMatrix = (rows, cols) => {
    let matrix = [];
    for (let r = 0; r <= rows; r++) {
      matrix[r] = new Array(cols + 1).fill(0);
    }
    return matrix;
  };

  // dpTableTwoChoices: Counts for arbitrary G, B choices
  // dpTableTwoChoices[idx][currentSum] stores the number of ways to achieve currentSum
  // using elements up to numbersArray[idx-1] with G or B.
  let dpTableTwoChoices = createZeroFilledMatrix(numElements, maxTargetSum);
  dpTableTwoChoices[0][0] = 1;

  for (let elementIndex = 0; elementIndex < numElements; elementIndex++) {
    const currentElementValue = numbersArray[elementIndex];
    const nextElementIndex = elementIndex + 1;

    for (let currentPartialSum = 0; currentPartialSum <= maxTargetSum; currentPartialSum++) {
      const waysFromPrevious = dpTableTwoChoices[elementIndex][currentPartialSum];

      // Case 1: Don't include currentElementValue
      dpTableTwoChoices[nextElementIndex][currentPartialSum] = safeModulo(dpTableTwoChoices[nextElementIndex][currentPartialSum] + waysFromPrevious);

      // Case 2: Include currentElementValue (either as G or B, so 2 ways)
      const nextSumCandidate = currentPartialSum + currentElementValue;
      if (nextSumCandidate <= maxTargetSum) {
        const waysToAdd = safeModulo(2 * waysFromPrevious);
        dpTableTwoChoices[nextElementIndex][nextSumCandidate] = safeModulo(dpTableTwoChoices[nextElementIndex][nextSumCandidate] + waysToAdd);
      }
    }
  }

  let finalAnswer = 1; // Original ans
  for (let i = 0; i < numElements; i++) {
    finalAnswer = safeModulo(finalAnswer * 3);
  }

  // Subtract contributions from dpTableTwoChoices
  for (let currentSum = 0; currentSum <= maxTargetSum; currentSum++) {
    const countForSum = dpTableTwoChoices[numElements][currentSum];
    finalAnswer = safeModulo(finalAnswer - safeModulo(3 * countForSum));
  }

  // dpTableOneChoice: Counts for arbitrary G choices only
  // dpTableOneChoice[idx][currentSum] stores the number of ways to achieve currentSum
  // using elements up to numbersArray[idx-1] with G.
  let dpTableOneChoice = createZeroFilledMatrix(numElements, maxTargetSum);
  dpTableOneChoice[0][0] = 1;

  for (let elementIndex = 0; elementIndex < numElements; elementIndex++) {
    const currentElementValue = numbersArray[elementIndex];
    const nextElementIndex = elementIndex + 1;

    for (let currentPartialSum = 0; currentPartialSum <= maxTargetSum; currentPartialSum++) {
      const waysFromPrevious = dpTableOneChoice[elementIndex][currentPartialSum];

      // Case 1: Don't include currentElementValue
      dpTableOneChoice[nextElementIndex][currentPartialSum] = safeModulo(dpTableOneChoice[nextElementIndex][currentPartialSum] + waysFromPrevious);

      // Case 2: Include currentElementValue (only as G, so 1 way)
      const nextSumCandidate = currentPartialSum + currentElementValue;
      if (nextSumCandidate <= maxTargetSum) {
        dpTableOneChoice[nextElementIndex][nextSumCandidate] = safeModulo(dpTableOneChoice[nextElementIndex][nextSumCandidate] + waysFromPrevious);
      }
    }
  }

  // Add back contributions if total sum is even
  if (totalElementsSum % 2 === 0) {
    const countForHalfSum = dpTableOneChoice[numElements][maxTargetSum];
    finalAnswer = safeModulo(finalAnswer + safeModulo(3 * countForHalfSum));
  }

  console.log(finalAnswer);
}

Main(require('fs').readFileSync('/dev/stdin', 'utf8'));

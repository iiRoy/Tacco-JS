'use strict'

// Helper function to parse a string of space-separated numbers into an array of integers.
function parseInputNumbers(inputString) {
  return inputString.trim().split(/\s+/).map(valStr => parseInt(valStr, 10));
}

// Helper function to create and initialize a 2D array (DP table) with zeros.
function initializeDPTable(numRows, numCols) {
  const table = [];
  for (let r = 0; r < numRows; r++) {
    table.push(new Array(numCols).fill(0));
  }
  return table;
}

// Helper for modular addition: (a + b) % m
function addMod(valA, valB, modulus) {
  return (valA + valB) % modulus;
}

// Helper for modular subtraction: (a - b + m) % m, ensuring a positive result.
function subMod(valA, valB, modulus) {
  return (valA - valB + modulus) % modulus;
}

// Helper for modular multiplication: (a * b) % m
function mulMod(valA, valB, modulus) {
  return (valA * valB) % modulus;
}

// Helper for modular exponentiation: (base^exp) % modulus
function powerMod(baseVal, exponent, modulus) {
  let result = 1;
  baseVal %= modulus;
  while (exponent > 0) {
    if (exponent % 2 === 1) result = mulMod(result, baseVal, modulus);
    baseVal = mulMod(baseVal, baseVal, modulus);
    exponent = Math.floor(exponent / 2);
  }
  return result;
}

// Generic DP calculation function, parameterized by a multiplier for item inclusion.
// This function computes the number of ways to achieve various sums using a subset of items.
function computeDPCombinations(itemsArray, totalItemCount, maxPossibleSum, modulus, inclusionMultiplier) {
  const dpMatrix = initializeDPTable(totalItemCount + 1, maxPossibleSum + 1);
  dpMatrix[0][0] = 1; // Base case: 1 way to make sum 0 with no items.

  for (let currentItemIndex = 0; currentItemIndex < totalItemCount; currentItemIndex++) {
    const currentItemValue = itemsArray[currentItemIndex];
    for (let currentAccumulatedSum = 0; currentAccumulatedSum <= maxPossibleSum; currentAccumulatedSum++) {
      // Option 1: Do not include the current item.
      // The number of ways to achieve 'currentAccumulatedSum' with items up to 'currentItemIndex'
      // is added to the next state (items up to 'currentItemIndex + 1').
      dpMatrix[currentItemIndex + 1][currentAccumulatedSum] = addMod(
        dpMatrix[currentItemIndex + 1][currentAccumulatedSum],
        dpMatrix[currentItemIndex][currentAccumulatedSum],
        modulus
      );

      // Option 2: Include the current item.
      const nextAccumulatedSum = currentAccumulatedSum + currentItemValue;
      if (nextAccumulatedSum <= maxPossibleSum) {
        // The number of ways to achieve 'currentAccumulatedSum' with previous items,
        // multiplied by 'inclusionMultiplier' (e.g., 2 for 'g' or 'b', 1 for 'g' only),
        // is added to the state for 'nextAccumulatedSum'.
        const valueToAdd = mulMod(dpMatrix[currentItemIndex][currentAccumulatedSum], inclusionMultiplier, modulus);
        dpMatrix[currentItemIndex + 1][nextAccumulatedSum] = addMod(
          dpMatrix[currentItemIndex + 1][nextAccumulatedSum],
          valueToAdd,
          modulus
        );
      }
    }
  }
  return dpMatrix;
}


function processInput(rawDataString){
  const largeConstant = Math.pow(2,50); // This constant was present in the original but unused. Preserved for Type III.
  const modulusValue = 998244353; // The modulus K

  let parsedNumbers = parseInputNumbers(rawDataString);
  let itemCount = parsedNumbers.shift(); // N
  let itemValues = parsedNumbers; // The array of numbers (g, b values)

  let totalSum = itemValues.reduce((accumulator, currentVal) => accumulator + currentVal, 0);
  let targetHalfSum = Math.floor(totalSum / 2); // half

  // DP Table A: Calculates combinations where each item can be chosen as 'g' or 'b'.
  // Thus, when an item is included, it contributes 2 ways (g or b) for each previous combination.
  const dpTableA = computeDPCombinations(itemValues, itemCount, targetHalfSum, modulusValue, 2);
  
  // Initialize finalResult with 3^N % K.
  // This represents the total number of ways to assign 'g', 'b', or 'r' to N items
  // without any constraints.
  let finalResult = powerMod(3, itemCount, modulusValue);

  // Subtract contributions from dpTableA.
  // For each sum 's' achievable by 'g' or 'b' items, we subtract 3 * (ways to make sum 's').
  // This accounts for cases where 'g' and 'b' sums are equal, or 'g' sum is equal to 'r' sum, etc.
  for (let currentSum = 0; currentSum <= targetHalfSum; currentSum++) {
    finalResult = subMod(finalResult, mulMod(3, dpTableA[itemCount][currentSum], modulusValue), modulusValue);
  }
  
  // DP Table B: Calculates combinations where each item can only be chosen as 'g'.
  // Thus, when an item is included, it contributes 1 way (g only) for each previous combination.
  const dpTableB = computeDPCombinations(itemValues, itemCount, targetHalfSum, modulusValue, 1);
  
  // If the total sum is even, we add back a specific contribution.
  // This corrects for over-subtraction in cases where the sum of 'g' items equals 'half'
  // and the sum of 'b' items also equals 'half' (which implies total sum is even).
  if (totalSum % 2 === 0) {
    finalResult = addMod(finalResult, mulMod(3, dpTableB[itemCount][targetHalfSum], modulusValue), modulusValue);
  }
  
  // Ensure the final result is positive, as modular arithmetic can sometimes yield negative results
  // if not carefully managed at each step. The subMod helper already handles this, but this is a final safeguard.
  finalResult = (finalResult + modulusValue) % modulusValue;

  console.log(finalResult);
}

// Read input from stdin and pass it to the main processing function.
processInput(require('fs').readFileSync('/dev/stdin','utf8'));

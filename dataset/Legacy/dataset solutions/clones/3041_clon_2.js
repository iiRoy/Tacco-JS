'use strict';

// This function processes input data to calculate a specific combinatorial result.
function ProcessData(rawData) {
  // A very large constant, not directly used in the main calculation logic.
  const largeConstant = Math.pow(2, 50);
  // The modulus value for all arithmetic operations to prevent overflow.
  const MOD_VAL = 998244353;

  // Prepare the input: trim whitespace, split by spaces, and convert to numbers.
  let numericValues = rawData.trim().split(/\s+/).map(val => Number(val));

  // The first element is the count of subsequent numbers.
  const countElements = numericValues.shift();
  // Calculate the total sum of the remaining numbers.
  const totalSum = numericValues.reduce((accumulator, currentValue) => accumulator + currentValue, 0);
  // Determine the target half sum for dynamic programming.
  const targetHalfSum = Math.floor(totalSum / 2);

  // Initialize the first dynamic programming table.
  // dynamicProgTable1[i][j] stores the number of ways to achieve sum 'j'
  // using a subset of the first 'i' elements, considering two types of elements (g and b).
  let dynamicProgTable1 = [];
  for (let idxRow = 0; idxRow <= countElements; idxRow++) {
    dynamicProgTable1[idxRow] = [];
    for (let idxCol = 0; idxCol <= targetHalfSum; idxCol++) {
      dynamicProgTable1[idxRow][idxCol] = 0;
    }
  }
  // Base case: there's one way to achieve a sum of 0 with no elements.
  dynamicProgTable1[0][0] = 1;

  // Populate the first DP table.
  for (let currentElementIdx = 0; currentElementIdx < countElements; currentElementIdx++) {
    for (let currentSum = 0; currentSum <= targetHalfSum; currentSum++) {
      // Option 1: Do not include the current element.
      dynamicProgTable1[currentElementIdx + 1][currentSum] += dynamicProgTable1[currentElementIdx][currentSum];
      dynamicProgTable1[currentElementIdx + 1][currentSum] %= MOD_VAL;

      // Option 2: Include the current element.
      // If including the current element doesn't exceed the target half sum.
      if (currentSum + numericValues[currentElementIdx] <= targetHalfSum) {
        // Multiply by 2 because there are two types (g and b) for each element.
        dynamicProgTable1[currentElementIdx + 1][currentSum + numericValues[currentElementIdx]] += 2 * dynamicProgTable1[currentElementIdx][currentSum];
        dynamicProgTable1[currentElementIdx + 1][currentSum + numericValues[currentElementIdx]] %= MOD_VAL;
      }
    }
  }

  // Initialize the final result variable.
  let finalResult = 1;
  // Calculate 3^N modulo MOD_VAL.
  for (let loopCounter = 0; loopCounter < countElements; loopCounter++) {
    finalResult *= 3;
    finalResult %= MOD_VAL;
  }

  // Subtract contributions from the first DP table.
  // For each possible sum 'x' in the last row of dynamicProgTable1, subtract 3*x.
  dynamicProgTable1[countElements].forEach(function(countVal) {
    finalResult -= 3 * countVal;
  });

  // Initialize the second dynamic programming table.
  // dynamicProgTable2[i][j] stores the number of ways to achieve sum 'j'
  // using a subset of the first 'i' elements, considering only one type of element (g).
  let dynamicProgTable2 = [];
  for (let rowIdx = 0; rowIdx <= countElements; rowIdx++) {
    dynamicProgTable2[rowIdx] = [];
    for (let colIdx = 0; colIdx <= targetHalfSum; colIdx++) {
      dynamicProgTable2[rowIdx][colIdx] = 0;
    }
  }
  // Base case: one way to achieve sum 0 with no elements.
  dynamicProgTable2[0][0] = 1;

  // Populate the second DP table.
  for (let elemIndex = 0; elemIndex < countElements; elemIndex++) {
    for (let currentPartialSum = 0; currentPartialSum <= targetHalfSum; currentPartialSum++) {
      // Option 1: Do not include the current element.
      dynamicProgTable2[elemIndex + 1][currentPartialSum] += dynamicProgTable2[elemIndex][currentPartialSum];
      dynamicProgTable2[elemIndex + 1][currentPartialSum] %= MOD_VAL;

      // Option 2: Include the current element.
      // If including the current element doesn't exceed the target half sum.
      if (currentPartialSum + numericValues[elemIndex] <= targetHalfSum) {
        // Only add dynamicProgTable2[elemIndex][currentPartialSum] as there's only one type.
        dynamicProgTable2[elemIndex + 1][currentPartialSum + numericValues[elemIndex]] += dynamicProgTable2[elemIndex][currentPartialSum];
        dynamicProgTable2[elemIndex + 1][currentPartialSum + numericValues[elemIndex]] %= MOD_VAL;
      }
    }
  }

  // Adjust the final result based on the total sum parity and the second DP table.
  if (totalSum % 2 === 0) {
    finalResult += 3 * dynamicProgTable2[countElements][targetHalfSum];
    finalResult %= MOD_VAL;
  }

  // Ensure the final result is positive by adding MOD_VAL if it's negative, then taking modulo.
  finalResult += MOD_VAL;
  finalResult %= MOD_VAL;

  // Output the calculated result.
  console.log(finalResult);
}

// Read input from standard input and pass it to the processing function.
ProcessData(require('fs').readFileSync('/dev/stdin', 'utf8'));

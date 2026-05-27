'use strict';
(function(dataInput) {
  // Process the raw input string: trim whitespace, split by any whitespace,
  // then convert each part to a number using the unary plus operator.
  dataInput = dataInput.trim().split(/\s+/).map(numericStr => +numericStr);

  // Declare core constants derived from the processed input and a modulo value.
  const totalElements = dataInput[0]; // Represents N from the problem statement
  const subsetSize = dataInput[1];    // Represents K from the problem statement
  // Calculate remainingElements: N - K + 1, which is L in the original context.
  const remainingElements = totalElements - subsetSize + 1;
  // Define the modulo constant for all arithmetic operations.
  const moduloValue = (1e9 + 7);

  /**
   * Performs modular addition of two numbers.
   * @param {number} valA - The first operand for addition.
   * @param {number} valB - The second operand for addition.
   * @returns {number} The result of (valA + valB) modulo moduloValue.
   */
  function addMod(valA, valB) {
    return (valA + valB) % moduloValue;
  }

  /**
   * Performs modular multiplication of two numbers using a custom bit-shifting
   * strategy to manage intermediate products, especially useful for large numbers
   * before applying the modulo. It decomposes numbers into 9-bit chunks.
   * @param {number} valA - The first number to multiply.
   * @param {number} valB - The second number to multiply.
   * @returns {number} The result of (valA * valB) modulo moduloValue.
   */
  function multiplyMod(valA, valB) {
    // Decompose valA into three 9-bit parts (partA3, partA2, partA1)
    let partA1 = (valA >>> 18); // Most significant 9 bits (shifted right by 18)
    let partA2 = (valA >>> 9) - (partA1 << 9); // Middle 9 bits
    let partA3 = valA - (partA1 << 18) - (partA2 << 9); // Least significant 9 bits
    let partsA = [partA3, partA2, partA1]; // Store parts in an array

    // Decompose valB into three 9-bit parts (partB3, partB2, partB1)
    let partB1 = (valB >>> 18);
    let partB2 = (valB >>> 9) - (partB1 << 9);
    let partB3 = valB - (partB1 << 18) - (partB2 << 9);
    let partsB = [partB3, partB2, partB1];

    let resultAccumulator = 0; // Initialize the final result accumulator

    // Iterate through all combinations of parts from valA and valB
    for (let idx1 = 0; idx1 < 3; idx1++) {
      for (let idx2 = 0; idx2 < 3; idx2++) {
        // Calculate the product of the current parts, then apply modulo
        let intermediateProduct = (partsA[idx1] * partsB[idx2]) % moduloValue;

        // Apply appropriate powers of 2^9 (which is 1 << 9) based on the indices
        // The sum of indices (idx1 + idx2) determines how many times to multiply by 2^9.
        for (let idx3 = 0; idx3 < idx1 + idx2; idx3++) {
          intermediateProduct = (intermediateProduct * (1 << 9)) % moduloValue;
        }
        // Add this calculated intermediate product to the total result
        resultAccumulator = addMod(resultAccumulator, intermediateProduct);
      }
    }
    return resultAccumulator;
  }

  // Initialize a 2D array to store combination values, effectively Pascal's Triangle.
  // The array size is (totalElements + 1) rows. Each row 'rowIdx' will have 'rowIdx + 1' columns.
  const pascalTriangle = new Array(totalElements + 1).fill(0).map((unusedVal, rowIdx) => {
    // Initialize each row with 1s, as C(n, 0) and C(n, n) are always 1.
    return new Array(rowIdx + 1).fill(1);
  });

  // Populate Pascal's Triangle using the recurrence relation C(n, k) = C(n-1, k-1) + C(n-1, k).
  // Start from rowIdx = 2 because C(0,0), C(1,0), C(1,1) are already correctly set to 1.
  for (let rowIdx = 2; rowIdx < totalElements + 1; rowIdx++) {
    // Iterate for colIdx from 1 to rowIdx - 1 (exclusive), as C(n,0) and C(n,n) are 1.
    for (let colIdx = 1; colIdx < rowIdx; colIdx++) {
      pascalTriangle[rowIdx][colIdx] = addMod(pascalTriangle[rowIdx - 1][colIdx - 1], pascalTriangle[rowIdx - 1][colIdx]);
    }
  }

  // Prepare an array to store the final computed results for output.
  const finalResults = [];

  // Iterate from 0 up to subsetSize - 1 (inclusive) to calculate the required products.
  // This loop corresponds to the 'I' loop in the original problem.
  for (let outerLoopIdx = 0; outerLoopIdx < subsetSize; outerLoopIdx++) {
    // The problem uses 1-based indexing for 'i', so convert outerLoopIdx.
    let currentVal = outerLoopIdx + 1;
    // Calculate the product of two combination values and store it.
    // This calculation is C(L, i) * C(K-1, i-1) from the problem.
    finalResults.push(multiplyMod(pascalTriangle[remainingElements][currentVal], pascalTriangle[subsetSize - 1][currentVal - 1]));
  }

  // Output the final results, with each result on a new line.
  console.log(finalResults.join('\n'));

// The Immediately Invoked Function Expression (IIFE) executes with the content
// of /dev/stdin, read as a UTF-8 string.
})(require('fs').readFileSync('/dev/stdin', 'utf8'));

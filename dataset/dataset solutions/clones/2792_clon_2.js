'use strict';
// This immediately-invoked function expression (IIFE) encapsulates the script's logic.
// It takes the raw input string as an argument.
(function(dataInput) {
  // First, clean and parse the input string.
  // - `trim()` removes leading/trailing whitespace.
  // - `split(/\s+/)` splits the string into an array of substrings using any whitespace as a delimiter.
  // - `map(val => Number(val))` converts each substring in the array to a numeric value.
  dataInput = dataInput.trim().split(/\s+/).map(val => Number(val));

  // Define problem-specific constants from the parsed input array.
  const totalElements = dataInput[0]; // Corresponds to 'N' in the original problem statement.
  const selectedCount = dataInput[1]; // Corresponds to 'K' in the original problem statement.
  // Calculate 'L': the number of elements remaining when 'K' items are chosen from 'N', plus one.
  const remainingElements = totalElements - selectedCount + 1;
  // Define the modulo value, a large prime number often used in competitive programming.
  const moduloValue = 1_000_000_007; // Corresponds to 'M' (10^9 + 7).

  /**
   * Computes the sum of two numbers modulo `moduloValue`.
   * This function ensures that the result remains within the bounds of the modulo.
   * @param {number} valA - The first integer operand.
   * @param {number} valB - The second integer operand.
   * @returns {number} The modular sum (valA + valB) % moduloValue.
   */
  function addMod(valA, valB) {
    return (valA + valB) % moduloValue;
  }

  /**
   * Computes the product of two numbers modulo `moduloValue`.
   * This implementation uses a technique to handle potential intermediate overflows
   * when multiplying large numbers before applying the modulo. It splits each number
   * into 16-bit high and low parts, effectively performing (A*2^16 + A_)*(B*2^16 + B_)
   * and then taking the modulo of each term.
   * @param {number} valA - The first integer operand.
   * @param {number} valB - The second integer operand.
   * @returns {number} The modular product (valA * valB) % moduloValue.
   */
  function multiplyMod(valA, valB) {
    // Extract the higher 16 bits of each number.
    const highA = (valA >> 16); // Equivalent to floor(valA / 2^16)
    const highB = (valB >> 16); // Equivalent to floor(valB / 2^16)

    // Extract the lower 16 bits of each number.
    const lowA = valA - (highA << 16); // Equivalent to valA % 2^16
    const lowB = valB - (highB << 16); // Equivalent to valB % 2^16

    // Calculate the four terms of the expanded product (A*2^16 + A_)*(B*2^16 + B_)
    // and apply modulo at each step to prevent overflow.
    // Term 1: (highA * highB * 2^32) % moduloValue
    const termC = (((((highA * highB) % moduloValue) << 16) % moduloValue) << 16) % moduloValue;
    // Term 2: (highA * lowB * 2^16) % moduloValue
    const termD = (((highA * lowB) % moduloValue) << 16) % moduloValue;
    // Term 3: (lowA * highB * 2^16) % moduloValue
    const termE = (((lowA * highB) % moduloValue) << 16) % moduloValue;
    // Term 4: (lowA * lowB) % moduloValue
    const termF = (lowA * lowB) % moduloValue;

    // Sum all four terms and take the final modulo.
    const finalResult = (termC + termD + termE + termF) % moduloValue;
    return finalResult;
  }

  // Initialize a 2D array (matrix) to store binomial coefficients C(n, k).
  // The array will have `totalElements + 1` rows.
  // Each row `rowIdx` will contain `rowIdx + 1` elements, representing C(rowIdx, 0) to C(rowIdx, rowIdx).
  // Initially, C(n, 0) and C(n, n) are set to 1 for all n.
  const binomCoeffs = new Array(totalElements + 1).fill(0).map((_unused, rowIdx) => {
    const row = new Array(rowIdx + 1).fill(1); // C(n, 0) and C(n, n) are always 1.
    return row;
  });

  // Populate the `binomCoeffs` array using Pascal's identity: C(n, k) = C(n-1, k-1) + C(n-1, k).
  // We start from `rowIdx = 2` because C(0,0), C(1,0), and C(1,1) are already correctly initialized to 1.
  for (let rowIdx = 2; rowIdx <= totalElements; rowIdx++) {
    // Iterate for `colIdx` from 1 to `rowIdx - 1`, as C(rowIdx, 0) and C(rowIdx, rowIdx) are already 1.
    for (let colIdx = 1; colIdx < rowIdx; colIdx++) {
      binomCoeffs[rowIdx][colIdx] = addMod(binomCoeffs[rowIdx - 1][colIdx - 1], binomCoeffs[rowIdx - 1][colIdx]);
    }
  }

  // An array to store the final computed results for each iteration.
  const resultsArray = [];

  // Loop `selectedCount` times to compute the required products of combinations.
  // The loop variable `outerLoopIdx` runs from 0 to `selectedCount - 1`.
  // `currentK` is a 1-based index derived from `outerLoopIdx`, used for combination lookups.
  for (let outerLoopIdx = 0; outerLoopIdx < selectedCount; outerLoopIdx++) {
    let currentK = outerLoopIdx + 1; // Adjust to 1-based indexing for the problem's 'i'.

    // Retrieve the two combination terms: C(L, i) and C(K-1, i-1).
    const term1 = binomCoeffs[remainingElements][currentK];
    const term2 = binomCoeffs[selectedCount - 1][currentK - 1];

    // Calculate their product modulo `moduloValue` and add to the results array.
    resultsArray.push(multiplyMod(term1, term2));
  }

  // Output the final results. Each element of `resultsArray` is printed on a new line.
  console.log(resultsArray.join('\n'));

})(require('fs').readFileSync('/dev/stdin', 'utf8')); // Read input from standard input.

'use strict';
(function(rawInputData){
  // This block is responsible for parsing the raw input data.
  // It ensures the input is clean and converted into usable numeric parameters.
  const processedInputString = rawInputData.toString().trim();
  const inputStringTokens = processedInputString.split(/\s+/);

  // Essential validation: Check if enough input values are provided.
  if (inputStringTokens.length < 2) {
    console.error("Error: Insufficient input values. Expected at least two numbers (total count and selection size).");
    // In a production environment, one might throw a more specific error or exit.
    process.exit(1);
  }

  // Convert string tokens to base-10 integers.
  const numericParameters = inputStringTokens.map(val => parseInt(val, 10));

  // Assign parsed numerical values to descriptive constants.
  const grandTotalItems = numericParameters[0]; // Corresponds to original N
  const selectionCount = numericParameters[1];   // Corresponds to original K

  // Further validation for logical consistency of input parameters.
  if (grandTotalItems < 0 || selectionCount < 0) {
    console.error("Error: Input counts (grandTotalItems, selectionCount) must be non-negative.");
    process.exit(1);
  }
  if (grandTotalItems < selectionCount) {
    console.error("Error: grandTotalItems cannot be less than selectionCount.");
    process.exit(1);
  }

  // Compute a derived length parameter, equivalent to L = N - K + 1.
  const effectiveRangeLength = grandTotalItems - selectionCount + 1;
  // Define the modulus for all arithmetic operations.
  const primeModulo = 1000000007; // Corresponds to original M (1e9+7)

  /**
   * Performs modular addition of two numbers.
   * Ensures the result stays within the [0, primeModulo-1] range.
   * @param {number} operandA The first number.
   * @param {number} operandB The second number.
   * @returns {number} (operandA + operandB) % primeModulo.
   */
  const addWithMod = (operandA, operandB) => {
    return (operandA + operandB) % primeModulo;
  };

  /**
   * Implements modular multiplication using a modified "Russian peasant" algorithm.
   * This method efficiently computes (factorX * factorY) % primeModulo
   * while avoiding direct large intermediate products that could exceed
   * JavaScript's safe integer limits for numbers up to primeModulo.
   * @param {number} factorX The multiplicand.
   * @param {number} factorY The multiplier.
   * @returns {number} (factorX * factorY) % primeModulo.
   */
  function modularProduct(factorX, factorY) {
    let currentResult = 0;
    // Normalize factors to be within the modulo range.
    factorX %= primeModulo;
    factorY %= primeModulo;

    // Loop until the multiplier (factorY) becomes zero.
    while (factorY > 0) {
      // If factorY is odd, add factorX (modulo primeModulo) to the currentResult.
      if (factorY & 1) { // Bitwise AND is an efficient check for oddness.
        currentResult = addWithMod(currentResult, factorX);
      }
      // Double factorX (modulo primeModulo).
      factorX = addWithMod(factorX, factorX);
      // Halve factorY (integer division).
      factorY >>= 1; // Bitwise right shift is an efficient integer division by 2.
    }
    return currentResult;
  }

  // Initialize a 2D array to store binomial coefficients (Pascal's Triangle).
  // The table size is (grandTotalItems + 1) x (grandTotalItems + 1).
  const binomialCoefficientTable = new Array(grandTotalItems + 1)
    .fill(null) // Fill with nulls initially for map to work on array elements.
    .map(() => new Array(grandTotalItems + 1).fill(0)); // Each inner array filled with zeros.

  // Explicitly set the base cases for binomial coefficients: C(n, 0) = 1 and C(n, n) = 1.
  // This differs from the original's combined initialization strategy.
  for (let nIdx = 0; nIdx <= grandTotalItems; ++nIdx) {
    binomialCoefficientTable[nIdx][0] = 1; // C(n, 0) is always 1.
    if (nIdx > 0) {
      binomialCoefficientTable[nIdx][nIdx] = 1; // C(n, n) is always 1 (for n > 0).
    }
  }

  // Populate the rest of the binomial coefficient table using Pascal's identity:
  // C(n, k) = C(n-1, k-1) + C(n-1, k).
  for (let nIdx = 2; nIdx <= grandTotalItems; ++nIdx) { // Start from n=2, as n=0,1 are base cases.
    for (let kIdx = 1; kIdx < nIdx; ++kIdx) { // k ranges from 1 to n-1.
      // Fetch the two values from the previous row.
      const termFromUpperLeft = binomialCoefficientTable[nIdx - 1][kIdx - 1];
      const termFromUpperRight = binomialCoefficientTable[nIdx - 1][kIdx];
      // Compute and store the new coefficient using modular addition.
      binomialCoefficientTable[nIdx][kIdx] = addWithMod(termFromUpperLeft, termFromUpperRight);
    }
  }

  // An array to collect all the final computed results.
  const finalComputedResults = [];

  // Main computation loop: calculates K specific products of binomial coefficients.
  // Changed the loop structure from 'for' to 'while' for variety.
  let currentIterationOffset = 0;
  while (currentIterationOffset < selectionCount) {
    // 'currentTermIndex' corresponds to 'i' in the original code, which is I+1.
    const currentTermIndex = currentIterationOffset + 1;

    // Retrieve the first binomial coefficient: C(effectiveRangeLength, currentTermIndex).
    const coefficientOne = binomialCoefficientTable[effectiveRangeLength][currentTermIndex];
    // Retrieve the second binomial coefficient: C(selectionCount - 1, currentTermIndex - 1).
    const coefficientTwo = binomialCoefficientTable[selectionCount - 1][currentTermIndex - 1];

    // Calculate the modular product of these two coefficients.
    const computedProduct = modularProduct(coefficientOne, coefficientTwo);

    // Add the computed product to our results array.
    finalComputedResults.push(computedProduct);

    // Increment the loop counter.
    currentIterationOffset++;
  }

  // Output the collected results, each on a new line.
  // Using process.stdout.write for a slightly different output mechanism than console.log,
  // and ensuring a final newline character for standard output practices.
  process.stdout.write(finalComputedResults.join('\n') + '\n');

})(require('fs').readFileSync('/dev/stdin','utf8'));
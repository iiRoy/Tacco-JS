'use strict';

// This script processes numerical input to perform combinatorial calculations
// involving binomial coefficients and modular arithmetic.
// It is wrapped in an Immediately Invoked Function Expression (IIFE)
// to maintain a clean global scope.
(function(rawInputTextStream) {
  // --- Core Constants and Utility Functions ---

  // The primary modulus used for all modular arithmetic operations.
  const MODULUS_CONSTANT = (1e9 + 7);

  // Constants related to the complex modular multiplication algorithm.
  // Numbers are split into parts based on powers of 2^9.
  const CHUNK_BIT_SIZE = 9;
  const CHUNK_BASE_VALUE = 1 << CHUNK_BIT_SIZE; // Equivalent to 2^9 (512)
  const CHUNK_BASE_SQUARED = 1 << (2 * CHUNK_BIT_SIZE); // Equivalent to 2^18 (262144)

  /**
   * Performs modular addition: (val1 + val2) % MODULUS_CONSTANT.
   * Ensures the result is always positive and within [0, MODULUS_CONSTANT - 1].
   * @param {number} val1 - The first operand.
   * @param {number} val2 - The second operand.
   * @returns {number} The modular sum.
   */
  function performModularAddition(val1, val2) {
    const interimSum = val1 + val2;
    return interimSum >= MODULUS_CONSTANT ? interimSum - MODULUS_CONSTANT : interimSum;
  }

  /**
   * Calculates (base^exponent) % MODULUS_CONSTANT using binary exponentiation (exponentiation by squaring).
   * This is crucial for efficiently computing large powers within modular arithmetic,
   * especially for the `CHUNK_BASE_VALUE` in the complex multiplication.
   * @param {number} base - The base number.
   * @param {number} exponent - The power to raise the base to.
   * @returns {number} The result of (base^exponent) % MODULUS_CONSTANT.
   */
  function calculateModularPower(base, exponent) {
    let finalResult = 1;
    let currentBase = base % MODULUS_CONSTANT; // Ensure base is within modulus
    let currentExponent = exponent;

    while (currentExponent > 0) {
      // If exponent is odd, multiply result by current base
      if (currentExponent % 2 === 1) {
        finalResult = performModularAddition(0, complexModularMultiply(finalResult, currentBase));
      }
      // Square the base and halve the exponent
      currentBase = complexModularMultiply(currentBase, currentBase);
      currentExponent = Math.floor(currentExponent / 2);
    }
    return finalResult;
  }

  /**
   * Implements a custom modular multiplication algorithm designed to handle
   * potentially large intermediate products by splitting numbers into smaller parts.
   * This mimics a polynomial multiplication (a0 + a1*x + a2*x^2) * (b0 + b1*x + b2*x^2)
   * where x = CHUNK_BASE_VALUE (2^9).
   * @param {number} operandX - The first number to multiply.
   * @param {number} operandY - The second number to multiply.
   * @returns {number} The modular product (operandX * operandY) % MODULUS_CONSTANT.
   */
  function complexModularMultiply(operandX, operandY) {
    // Basic guard clause for non-negative inputs.
    if (operandX < 0 || operandY < 0) {
      console.error("Critical Error: Negative operands detected in complex modular multiplication.");
      return 0; // Or throw an error to halt execution.
    }

    // Split operandX into three parts based on CHUNK_BASE_VALUE.
    const operandX_parts = [
      operandX % CHUNK_BASE_VALUE,
      Math.floor((operandX % CHUNK_BASE_SQUARED) / CHUNK_BASE_VALUE),
      Math.floor(operandX / CHUNK_BASE_SQUARED)
    ];

    // Split operandY into three parts.
    const operandY_parts = [
      operandY % CHUNK_BASE_VALUE,
      Math.floor((operandY % CHUNK_BASE_SQUARED) / CHUNK_BASE_VALUE),
      Math.floor(operandY / CHUNK_BASE_SQUARED)
    ];

    let totalAccumulatedProduct = 0; // Accumulator for the final result.

    // Perform the cross-multiplication of parts, similar to polynomial multiplication.
    for (let x_idx = 0; x_idx < 3; ++x_idx) {
      for (let y_idx = 0; y_idx < 3; ++y_idx) {
        // Calculate the product of two individual parts.
        let currentTermProduct = (operandX_parts[x_idx] * operandY_parts[y_idx]);
        // Apply modulo early to keep numbers manageable.
        currentTermProduct %= MODULUS_CONSTANT;

        // Determine the power of CHUNK_BASE_VALUE corresponding to the current term.
        const basePowerFactor = calculateModularPower(CHUNK_BASE_VALUE, x_idx + y_idx);

        // Multiply the term product by the base power factor, then apply modulo.
        currentTermProduct = (currentTermProduct * basePowerFactor) % MODULUS_CONSTANT;

        // Add this term's contribution to the total product, using modular addition.
        totalAccumulatedProduct = performModularAddition(totalAccumulatedProduct, currentTermProduct);
      }
    }
    return totalAccumulatedProduct;
  }

  // --- Input Processing and Validation ---

  // Clean and prepare the raw input string.
  const processedInputString = rawInputTextStream.trim();

  // Guard clause for empty input.
  if (processedInputString.length === 0) {
    console.error("Execution Aborted: Provided input stream is empty.");
    return;
  }

  // Split the input string into individual string tokens using one or more whitespace characters.
  const stringTokenArray = processedInputString.split(/\s+/g);

  // Validate that enough numerical tokens were provided.
  if (stringTokenArray.length < 2) {
    console.error("Execution Aborted: Insufficient input tokens. Expected at least two numbers (N and K).");
    return;
  }

  // Convert string tokens to numbers, with robust validation for each.
  const numericalInputParameters = stringTokenArray.map(token => {
    const convertedNumber = Number(token);
    // Check if the conversion resulted in a valid non-negative integer.
    if (isNaN(convertedNumber) || !Number.isInteger(convertedNumber) || convertedNumber < 0) {
      console.error(`Input Error: Encountered an invalid or non-positive integer token: '${token}'.`);
      return -1; // Use -1 as a sentinel for invalid entries.
    }
    return convertedNumber;
  });

  // Final check after mapping: ensure no invalid numbers were found.
  if (numericalInputParameters.includes(-1)) {
    console.error("Execution Aborted: Input parsing failed due to one or more invalid number entries.");
    return;
  }

  // Extract the primary problem parameters.
  const totalAvailableItems_N = numericalInputParameters[0]; // Corresponds to 'N' in C(N, K)
  const desiredSelectionSize_K = numericalInputParameters[1]; // Corresponds to 'K' in C(N, K)

  // --- Initial Parameter Validation ---

  // Ensure K is within valid bounds relative to N.
  if (desiredSelectionSize_K > totalAvailableItems_N || desiredSelectionSize_K < 0 || totalAvailableItems_N < 0) {
    console.error("Execution Aborted: Invalid combinatorial parameters. 'K' must be between 0 and 'N' (inclusive), and both must be non-negative.");
    return;
  }

  // Calculate an adjusted 'N' value for the first combination term, as per problem logic.
  const firstCombination_EffectiveN = totalAvailableItems_N - desiredSelectionSize_K + 1;

  // --- Pre-computation of Binomial Coefficients (Pascal's Triangle) ---

  // Initialize a 2D array to store C(n, k) values.
  // The array size will be (totalAvailableItems_N + 1) rows.
  const precomputedBinomialCoefficients = [];

  // Populate the Pascal's Triangle array.
  // Initialize C(n, 0) and C(n, n) to 1 for all n.
  for (let current_n = 0; current_n <= totalAvailableItems_N; ++current_n) {
    const currentRow = new Array(current_n + 1).fill(0); // Create a row of appropriate size.
    currentRow[0] = 1; // C(n, 0) is always 1.
    if (current_n > 0) {
      currentRow[current_n] = 1; // C(n, n) is always 1.
    }
    precomputedBinomialCoefficients.push(currentRow);
  }

  // Fill in the rest of the binomial coefficients using the recurrence relation:
  // C(n, k) = C(n-1, k-1) + C(n-1, k)
  for (let current_n = 2; current_n <= totalAvailableItems_N; ++current_n) {
    for (let current_k = 1; current_k < current_n; ++current_k) {
      const valueFromAboveLeft = precomputedBinomialCoefficients[current_n - 1][current_k - 1];
      const valueFromAboveRight = precomputedBinomialCoefficients[current_n - 1][current_k];
      precomputedBinomialCoefficients[current_n][current_k] = performModularAddition(valueFromAboveLeft, valueFromAboveRight);
    }
  }

  // --- Final Calculation and Output Generation ---

  const finalComputedProducts = []; // Array to store the results of the main loop.

  // The problem requires iteration for 'i' from 1 to K.
  // The loop runs 'K' times, with `iterationIndex` going from 0 to K-1.
  for (let iterationIndex = 0; iterationIndex < desiredSelectionSize_K; ++iterationIndex) {
    const currentLoopValue_i = iterationIndex + 1; // 'i' in C(L, i) and C(K-1, i-1)

    // Defensive check to ensure combination indices are valid before access.
    // This handles edge cases where K or N might lead to invalid lookups if not fully constrained.
    if (currentLoopValue_i > firstCombination_EffectiveN || (currentLoopValue_i - 1) > (desiredSelectionSize_K - 1)) {
        console.warn(`Warning: Combination indices out of bounds for i=${currentLoopValue_i}. Skipping this iteration.`);
        continue;
    }

    // Retrieve the two required binomial coefficients.
    const firstCoefficient = precomputedBinomialCoefficients[firstCombination_EffectiveN][currentLoopValue_i];
    const secondCoefficient = precomputedBinomialCoefficients[desiredSelectionSize_K - 1][currentLoopValue_i - 1];

    // Multiply the two coefficients using the custom complex modular multiplication.
    const productForCurrent_i = complexModularMultiply(firstCoefficient, secondCoefficient);
    finalComputedProducts.push(productForCurrent_i);
  }

  // Output the final results, with each product on a new line.
  console.log(finalComputedProducts.join('\n'));

})(require('fs').readFileSync('/dev/stdin', 'utf8')); // Reads input from standard input using Node.js fs module.
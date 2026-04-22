"use strict";

// This script processes geometric data to calculate combinations based on vector relationships.

// --- Input Handling Utilities ---
// Reads the entire standard input as a UTF-8 string.
const dataStream = require("fs").readFileSync("/dev/stdin", "utf8");

// Splits the input string into tokens by spaces or newlines.
let tokenBuffer = dataStream.split(/ |\n/);
// Index to keep track of the current token being read.
let tokenIndex = 0;

/**
 * Retrieves the next token from the input buffer and converts it to a numeric type.
 * @returns {number} The parsed integer value.
 */
function readNextInteger() {
  return +tokenBuffer[tokenIndex++];
}

/**
 * Retrieves the next token from the input buffer as a string.
 * @returns {string} The raw string token.
 */
function readNextString() {
  return tokenBuffer[tokenIndex++];
}

/**
 * Retrieves the next token from the input buffer and converts it to a BigInt type.
 * @returns {BigInt} The parsed BigInt value.
 */
function readNextBigInt() {
  return BigInt(tokenBuffer[tokenIndex++]);
}

/**
 * Reads a sequence of 'quantity' tokens from the buffer.
 * @param {number} quantity - The number of tokens to read.
 * @param {boolean} [returnAsString=false] - If true, returns tokens as strings; otherwise, as numbers.
 * @returns {Array<number|string>} An array containing the read tokens.
 */
function readTokenArray(quantity, returnAsString = false) {
  const segment = tokenBuffer.slice(tokenIndex, tokenIndex + quantity);
  tokenIndex += quantity;
  return returnAsString ? segment : segment.map(Number);
}

/**
 * Reads a 2D array (matrix) of tokens with specified dimensions.
 * @param {number} rowCount - The number of rows in the matrix.
 * @param {number} colCount - The number of columns per row.
 * @param {boolean} [returnAsString=false] - If true, returns elements as strings; otherwise, as numbers.
 * @returns {Array<Array<number|string>>} The parsed matrix.
 */
function read2DArray(rowCount, colCount, returnAsString = false) {
  const matrixContent = [];
  for (let r = 0; r < rowCount; r++) {
    matrixContent.push(readTokenArray(colCount, returnAsString));
  }
  return matrixContent;
}

// The original `xArray` function for multi-dimensional array creation is not used in the main logic
// and contains an `eval` statement. It is removed in this Type III clone for simplification and security.

// --- Mathematical Utility Functions ---

/**
 * Calculates the Greatest Common Divisor (GCD) of two BigInts using the Euclidean algorithm.
 * Ensures the result is always non-negative.
 * @param {BigInt} valueA - The first BigInt operand.
 * @param {BigInt} valueB - The second BigInt operand.
 * @returns {BigInt} The GCD of valueA and valueB.
 */
function calculateGCD(valueA, valueB) {
  // Take absolute values to ensure GCD is non-negative.
  valueA = valueA < 0n ? -valueA : valueA;
  valueB = valueB < 0n ? -valueB : valueB;

  while (valueB !== 0n) {
    const temp = valueB;
    valueB = valueA % valueB;
    valueA = temp;
  }
  return valueA;
}

// A large prime number used as a modulus for arithmetic operations.
const primeModulus = 1000000007;

/**
 * Computes the modular product of multiple numbers.
 * All intermediate and final results are kept within the range [0, primeModulus-1].
 * @param {...number} multipliers - A variable number of integer arguments to multiply.
 * @returns {number} The modular product.
 */
function modularProduct(...multipliers) {
  let currentProduct = multipliers[0];
  for (let idx = 1; idx < multipliers.length; idx++) {
    currentProduct = (currentProduct * multipliers[idx]) % primeModulus;
  }
  return currentProduct;
}

// Caches for precomputed factorials and their modular inverses.
const factorialCache = [];
const invFactorialCache = [];

/**
 * Precomputes factorials and inverse factorials up to a specified maximum value.
 * This is useful for combinatorial calculations like nCr, though nCr/nPr are removed
 * from this clone as they are not used in the main problem logic.
 * @param {number} maxVal - The upper limit for precomputation.
 */
function precomputeFactorials(maxVal) {
  factorialCache.length = maxVal + 1;
  invFactorialCache.length = maxVal + 1;

  factorialCache[0] = 1;
  factorialCache[1] = 1;
  for (let i = 2; i <= maxVal; i++) {
    factorialCache[i] = modularProduct(factorialCache[i - 1], i);
  }

  // Calculate inverse factorial for maxVal first, then derive others.
  invFactorialCache[maxVal] = calculateModularInverse(factorialCache[maxVal]);
  invFactorialCache[0] = 1; // Inverse of 0! is 1.
  invFactorialCache[1] = 1; // Inverse of 1! is 1.

  for (let i = maxVal - 1; i >= 2; i--) {
    invFactorialCache[i] = modularProduct(invFactorialCache[i + 1], i + 1);
  }
  // Original code included commented-out arrays for modular inverses and powers of two,
  // which are removed here as they are not utilized.
}

/**
 * Computes the modular multiplicative inverse of a number 'val' modulo 'primeModulus'
 * using the Extended Euclidean Algorithm.
 * @param {number} val - The number for which to find the inverse.
 * @returns {number} The modular inverse of 'val'.
 */
function calculateModularInverse(val) {
  let currentMod = primeModulus;
  let coeffU = 0, coeffV = 1; // Coefficients for Bezout's identity.
  let tempA = val; // Temporary variable for 'val' in the loop.

  while (tempA !== 0) {
    const quotient = Math.floor(currentMod / tempA);
    const remainder = currentMod % tempA;

    currentMod = tempA;
    tempA = remainder;

    const prevCoeffU = coeffU;
    coeffU = coeffV - quotient * coeffU;
    coeffV = prevCoeffU;
  }
  // Ensure the result is positive.
  coeffV %= primeModulus;
  return coeffV < 0 ? coeffV + primeModulus : coeffV;
}

/**
 * Calculates (base^exp) % primeModulus efficiently using binary exponentiation.
 * @param {number} base - The base number.
 * @param {number} exponent - The exponent.
 * @returns {number} The result of base raised to the exponent, modulo primeModulus.
 */
function modularExponentiation(base, exponent) {
  let res = 1;
  base %= primeModulus; // Normalize base to be within the modulus range.

  while (exponent > 0) {
    if (exponent % 2 === 1) { // If the current bit of exponent is 1.
      res = modularProduct(res, base);
    }
    base = modularProduct(base, base); // Square the base.
    exponent = Math.floor(exponent / 2); // Halve the exponent.
  }
  return res;
}

// Original nCr and nPr functions are not used in the main logic and are removed for Type III cloning.

/**
 * Normalizes a number to be within the [0, primeModulus-1] range.
 * This handles potential negative results from subtraction or modulo operations.
 * @param {number} num - The number to normalize.
 * @returns {number} The normalized number.
 */
function normalizeModulo(num) {
  return (num % primeModulus + primeModulus) % primeModulus;
}

// --- Main Problem-Solving Logic ---

// Execute the primary function to solve the problem.
const calculatedSolution = solveProblem();

// Output the result if a valid solution was produced.
if (calculatedSolution !== undefined) {
  console.log(calculatedSolution);
}

/**
 * The main problem-solving function.
 * It processes a list of 2D coordinates to count specific geometric relationships
 * (e.g., perpendicular vectors or lines) modulo a prime number.
 * @returns {number} The final calculated count, normalized by primeModulus.
 */
function solveProblem() {
  const numberOfInputEntries = readNextInteger();

  // If there are no entries, the result is 0. This is a guard clause.
  if (numberOfInputEntries === 0) {
    return 0;
  }

  let countZeroA_nonzeroB = 0; // Counts (0, Y) where Y != 0
  let countNonzeroA_zeroB = 0; // Counts (X, 0) where X != 0

  // A nested object to store counts of unique, normalized (a, b) coordinate pairs.
  // Keys are string representations of BigInts.
  const uniqueCoordinatePairCounts = {};

  // Iterate through all input entries to categorize and normalize coordinate pairs.
  for (let entryIdx = 0; entryIdx < numberOfInputEntries; entryIdx++) {
    let currentA_val = readNextBigInt();
    let currentB_val = readNextBigInt();

    // Skip (0,0) pairs as they are trivial and don't contribute to slope logic.
    if (currentA_val === 0n && currentB_val === 0n) {
      continue;
    }

    // Categorize axis-parallel vectors separately.
    if (currentA_val === 0n) {
      countZeroA_nonzeroB++;
      continue;
    }
    if (currentB_val === 0n) {
      countNonzeroA_zeroB++;
      continue;
    }

    // Normalize the (a, b) pair by dividing by their GCD.
    const commonDivisor = calculateGCD(currentA_val, currentB_val);
    currentA_val /= commonDivisor;
    currentB_val /= commonDivisor;

    // Establish a canonical form for each pair:
    // Ensure the 'a' component is positive. If 'a' is zero, ensure 'b' is positive.
    // (The 'a' is zero case is handled above, so here 'a' will be non-zero).
    if (currentA_val < 0n) {
      currentA_val = -currentA_val;
      currentB_val = -currentB_val;
    }

    // Store the count of this normalized canonical pair.
    const a_as_string = String(currentA_val);
    const b_as_string = String(currentB_val);

    if (!uniqueCoordinatePairCounts[a_as_string]) {
      uniqueCoordinatePairCounts[a_as_string] = {};
    }
    uniqueCoordinatePairCounts[a_as_string][b_as_string] = (uniqueCoordinatePairCounts[a_as_string][b_as_string] || 0) + 1;
  }

  // Initialize the total combinations count.
  // This initial value accounts for combinations involving axis-parallel lines.
  // The formula (2^X + 2^Y - 1) is a common way to count subsets where at least one element
  // is chosen from either of two independent sets, including the case where both are chosen.
  let totalCombinations = (
    modularExponentiation(2, countZeroA_nonzeroB) +
    modularExponentiation(2, countNonzeroA_zeroB) -
    1
  );
  totalCombinations = normalizeModulo(totalCombinations);

  // Iterate through the collected unique (a, b) pairs to process their contributions
  // and interactions with their perpendicular counterparts.
  for (const [a_str_key, b_subMap] of Object.entries(uniqueCoordinatePairCounts)) {
    for (const [b_str_key, currentPairCount] of Object.entries(b_subMap)) {
      const currentA_bigint = BigInt(a_str_key);
      const currentB_bigint = BigInt(b_str_key);

      // Strategy to avoid double-counting perpendicular pairs:
      // For a pair (A, B), its perpendicular counterpart is (-B, A).
      // If B is negative, we check if (-B, A) (where -B is positive) has already been encountered.
      // If it has, we skip processing (A, B) because the pair (A,B) and (-B,A) will be
      // handled when iterating over (-B,A). This ensures each unique perpendicular group is processed once.
      if (currentB_bigint < 0n) {
        const perpA_str_candidate = String(-currentB_bigint);
        const perpB_str_candidate = String(currentA_bigint);

        if (uniqueCoordinatePairCounts[perpA_str_candidate] &&
            uniqueCoordinatePairCounts[perpA_str_candidate][perpB_str_candidate]) {
          continue; // Skip, this group will be handled from the (-B, A) perspective.
        }
      }

      // Now, for the current (A, B) pair (which is either canonical or not skipped),
      // find the count of its perpendicular counterpart (B, -A).
      const perpA_search_str = String(currentB_bigint);
      const perpB_search_str = String(-currentA_bigint);

      let perpendicularPairCount = 0;
      if (uniqueCoordinatePairCounts[perpA_search_str] &&
          uniqueCoordinatePairCounts[perpA_search_str][perpB_search_str]) {
        perpendicularPairCount = uniqueCoordinatePairCounts[perpA_search_str][perpB_search_str];
      }

      // Calculate the contribution from this specific group of vectors (current and perpendicular).
      // The formula used here is (2^C_perp - 1) + 2^C_current.
      // This represents choosing a non-empty subset of the perpendicular vectors,
      // OR choosing any subset (including empty) of the current vectors.
      let groupContribution = (modularExponentiation(2, perpendicularPairCount) - 1 + primeModulus) % primeModulus;
      groupContribution = (groupContribution + modularExponentiation(2, currentPairCount)) % primeModulus;

      // Multiply this group's contribution into the overall total combinations.
      totalCombinations = modularProduct(totalCombinations, groupContribution);
    }
  }

  // The final result usually needs to be decremented by 1 to exclude the case
  // where no lines/vectors are chosen at all (the empty set).
  return normalizeModulo(totalCombinations - 1);
}
"use strict";

// --- Input Processing Utilities ---

// Module for reading standard input
const dataStream = require("fs").readFileSync("/dev/stdin", "utf8");
let tokenBuffer = dataStream.split(/ |\n/);
let currentTokenIndex = 0;

/**
 * Reads the next token from the input buffer and converts it to a number.
 * @returns {number} The parsed number.
 */
function retrieveNextNumber() {
  return +tokenBuffer[currentTokenIndex++];
}

/**
 * Reads the next token from the input buffer as a string.
 * @returns {string} The raw string token.
 */
function retrieveNextString() {
  return tokenBuffer[currentTokenIndex++];
}

/**
 * Reads the next token from the input buffer and converts it to a BigInt.
 * @returns {BigInt} The parsed BigInt.
 */
function retrieveNextBigInt() {
  return BigInt(tokenBuffer[currentTokenIndex++]);
}

// --- Mathematical Utilities ---

/**
 * Computes the Greatest Common Divisor (GCD) of two BigInts using the Euclidean algorithm.
 * @param {BigInt} valA - The first BigInt.
 * @param {BigInt} valB - The second BigInt.
 * @returns {BigInt} The GCD of valA and valB.
 */
function calculateGCD(valA, valB) {
  // Ensure non-negative for GCD, absolute values are used.
  valA = valA < 0n ? -valA : valA;
  valB = valB < 0n ? -valB : valB;
  return valB === 0n ? valA : calculateGCD(valB, valA % valB);
}

// Prime modulus for modular arithmetic operations
const PRIME_MODULUS = 1_000_000_007; // Equivalent to 1e9 + 7

/**
 * Performs modular multiplication for two numbers.
 * Uses an optimized method to prevent overflow before applying modulo,
 * assuming numbers fit within standard integer types after bit shifts.
 * @param {number} num1 - The first number.
 * @param {number} num2 - The second number.
 * @returns {number} The result of (num1 * num2) % PRIME_MODULUS.
 */
function performModMultiplication(num1, num2) {
  // This optimization splits num1 into two parts (high 16 bits and low 16 bits)
  // to perform multiplication, reducing the chance of overflow before modulo.
  // It's equivalent to (num1 * num2) % PRIME_MODULUS for numbers where intermediate
  // products might exceed 2^31-1 but not 2^53-1 (JS safe integer limit).
  const highPart = (num1 >> 16) * num2 % PRIME_MODULUS * 65536; // 65536 = 2^16
  const lowPart = (num1 & 65535) * num2 % PRIME_MODULUS;
  return (highPart + lowPart) % PRIME_MODULUS;
}

/**
 * Calculates (base^exponent) % PRIME_MODULUS using binary exponentiation (exponentiation by squaring).
 * @param {number} base - The base number.
 * @param {number} exponent - The exponent.
 * @returns {number} The result of (base^exponent) % PRIME_MODULUS.
 */
function calculateModPower(base, exponent) {
  let result = 1;
  let currentBase = base % PRIME_MODULUS; // Ensure base is within modulus
  for (; exponent > 0; exponent >>= 1) { // Loop while exponent > 0, shifting right (dividing by 2)
    if (exponent & 1) { // If the last bit of exponent is 1 (exponent is odd)
      result = performModMultiplication(result, currentBase);
    }
    currentBase = performModMultiplication(currentBase, currentBase); // Square the base
  }
  return result;
}

/**
 * Ensures a number is within the range [0, PRIME_MODULUS - 1].
 * @param {number} value - The number to normalize.
 * @returns {number} The normalized number.
 */
function ensurePositiveMod(value) {
  return (value % PRIME_MODULUS + PRIME_MODULUS) % PRIME_MODULUS;
}

/**
 * Performs modular addition.
 * @param {number} a - The first operand.
 * @param {number} b - The second operand.
 * @returns {number} (a + b) % PRIME_MODULUS.
 */
function addMod(a, b) {
    return (a + b) % PRIME_MODULUS;
}

/**
 * Performs modular subtraction.
 * @param {number} a - The first operand.
 * @param {number} b - The second operand.
 * @returns {number} (a - b) % PRIME_MODULUS, ensuring a positive result.
 */
function subtractMod(a, b) {
    return (a - b % PRIME_MODULUS + PRIME_MODULUS) % PRIME_MODULUS;
}


// --- Main Solution Logic ---

/**
 * Executes the core problem-solving logic.
 * @returns {number} The final calculated result.
 */
function executeSolution() {
  const numberOfPairs = retrieveNextNumber();

  let zeroNumeratorCount = 0;   // Counts pairs like (0, X) where X != 0
  let zeroDenominatorCount = 0; // Counts pairs like (X, 0) where X != 0
  let bothZerosCount = 0;       // Counts pairs like (0, 0)

  // Map to store counts of normalized (numerator, denominator) pairs.
  // Keys are string representations of BigInts.
  // e.g., Map<string (numerator), Map<string (denominator), number (2^k)>>
  const normalizedFractionCounts = new Map();

  // Process each input pair
  for (let pairIndex = 0; pairIndex < numberOfPairs; ++pairIndex) {
    let currentNumerator = retrieveNextBigInt();
    let currentDenominator = retrieveNextBigInt();

    // Special handling for zero values
    if (currentNumerator === 0n) {
      if (currentDenominator === 0n) {
        bothZerosCount++;
      } else {
        zeroNumeratorCount++;
      }
      continue; // Move to the next pair
    }
    if (currentDenominator === 0n) {
      zeroDenominatorCount++;
      continue; // Move to the next pair
    }

    // Calculate GCD to simplify the fraction
    const commonFactor = calculateGCD(currentNumerator, currentDenominator);
    currentNumerator /= commonFactor;
    currentDenominator /= commonFactor;

    // Normalize the fraction: ensure numerator is positive.
    // If numerator is negative, negate both numerator and denominator.
    if (currentNumerator < 0n) {
      currentNumerator = -currentNumerator;
      currentDenominator = -currentDenominator;
    }

    const numStringKey = currentNumerator.toString();
    const denStringKey = currentDenominator.toString();

    // Update counts in the map
    if (!normalizedFractionCounts.has(numStringKey)) {
      normalizedFractionCounts.set(numStringKey, new Map());
    }
    const innerMap = normalizedFractionCounts.get(numStringKey);

    // The value stored is 2^k, where k is the number of occurrences.
    // If it's the first time for this (num, den), store 2 (2^1).
    // Otherwise, multiply current value by 2 (2^k * 2 = 2^(k+1)).
    const currentExponentiation = innerMap.get(denStringKey) || 1; // Default to 1 (representing 2^0)
    innerMap.set(denStringKey, performModMultiplication(currentExponentiation, 2));
  }

  // Calculate initial total combinations based on zero-related pairs.
  // This accounts for combinations of (0,X) and (X,0) pairs.
  // The formula (2^A + 2^B - 1) is for independent sets where at least one must be chosen.
  let totalCombinations = calculateModPower(2, zeroNumeratorCount);
  totalCombinations = addMod(totalCombinations, calculateModPower(2, zeroDenominatorCount));
  totalCombinations = subtractMod(totalCombinations, 1); // Subtract 1 for the empty set of (0,X) and (X,0)

  // Iterate through the map to combine orthogonal pairs (a/b and b/(-a))
  for (const [currentNumKey, innerMap] of normalizedFractionCounts.entries()) {
    for (const [currentDenKey, currentFractionTerm] of innerMap.entries()) {
      const parsedDenominator = BigInt(currentDenKey);

      // If the current denominator is negative, check if its inverse has already been processed.
      // e.g., if we have (1, -2), its inverse is (-2, 1) which normalizes to (2, -1).
      // We process (2, -1) first, so when we encounter (1, -2), we skip it.
      if (parsedDenominator < 0n) {
        const inverseNumKey = currentDenKey.slice(1); // e.g., "-2n".slice(1) -> "2n"
        const inverseDenKey = currentNumKey;           // e.g., "1n"
        if (normalizedFractionCounts.has(inverseNumKey) &&
            normalizedFractionCounts.get(inverseNumKey).has(inverseDenKey)) {
          continue; // This pair (currentNum/currentDen) was already handled
                    // when processing its inverse (inverseNum/inverseDen)
        }
      }

      // 'currentFractionTerm' is 2^k1 (for currentNum/currentDen)
      let groupContribution = currentFractionTerm;

      // Check for the inverse fraction: denominator / (-numerator)
      // This would be stored as (currentDen, -currentNum) after normalization.
      const invertedNumeratorKey = currentDenKey;
      const invertedDenominatorKey = "-" + currentNumKey; // e.g., "-(1n)" -> "-1n"

      if (normalizedFractionCounts.has(invertedNumeratorKey)) {
        const invertedInnerMap = normalizedFractionCounts.get(invertedNumeratorKey);
        if (invertedInnerMap.has(invertedDenominatorKey)) {
          const inverseFractionTerm = invertedInnerMap.get(invertedDenominatorKey); // This is 2^k2
          // For a group of k1 (a/b) and k2 (b/(-a)) fractions,
          // the number of ways to choose subsets (excluding the empty set) is (2^k1 + 2^k2 - 1).
          // We already have 2^k1 in groupContribution. Add (2^k2 - 1).
          groupContribution = addMod(groupContribution, subtractMod(inverseFractionTerm, 1));
        }
      }
      totalCombinations = performModMultiplication(totalCombinations, groupContribution);
    }
  }

  // Final adjustment:
  // totalCombinations currently represents the product of (2^k1 + 2^k2 - 1) terms,
  // which means it's the total ways to choose non-empty subsets from all orthogonal groups,
  // including (0,X) and (X,0) groups.
  // We need to subtract 1 for the overall empty set (which was implicitly included in the product structure)
  // and add back 'bothZerosCount' for the (0,0) pairs, as they can always be chosen independently.
  const finalResult = ensurePositiveMod(totalCombinations - 1 + bothZerosCount);
  return finalResult;
}

// Execute the solution and print the output if it's not undefined.
const finalCalculatedOutput = executeSolution();
if (finalCalculatedOutput !== undefined) {
  console.log(finalCalculatedOutput);
}
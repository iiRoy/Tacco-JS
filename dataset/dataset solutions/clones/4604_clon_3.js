"use strict";

// This module contains functions for processing numeric input and performing
// a specific modular arithmetic check.

/**
 * Determines if a linear congruence of the form (coefficientVal * k) % moduloVal === wantedRemainder
 * has a solution for an integer k within the range [0, moduloVal - 1].
 *
 * @param {number} coefficientVal The 'a' value in (a * k) % b = c.
 * @param {number} moduloVal The 'b' value in (a * k) % b = c, representing the modulus.
 * @param {number} wantedRemainder The 'c' value in (a * k) % b = c, the target remainder.
 * @returns {boolean} True if a solution (an integer k) exists, false otherwise.
 */
function checkModularEquationSolution(coefficientVal, moduloVal, wantedRemainder) {
  // Guard against invalid or trivial modulus values.
  // A modulus of 0 is mathematically undefined for this operation.
  // A modulus of 1 implies any number % 1 is 0, so the wantedRemainder must be 0.
  if (moduloVal <= 0) {
    // For competitive programming, this case might not occur with valid test data.
    // However, for robust code, it's a necessary check.
    return false;
  }
  if (moduloVal === 1) {
    return wantedRemainder === 0;
  }

  // Normalize the coefficient to its smallest non-negative equivalent modulo `moduloVal`.
  // This ensures we work with values in the range [0, moduloVal - 1].
  const effectiveCoefficient = (coefficientVal % moduloVal + moduloVal) % moduloVal;

  // Normalize the wanted remainder to be within [0, moduloVal - 1].
  // This handles cases where wantedRemainder might be negative or too large.
  const normalizedTargetRemainder = (wantedRemainder % moduloVal + moduloVal) % moduloVal;

  // Iterate through all possible integer multipliers 'k' from 0 up to (moduloVal - 1).
  // This range guarantees that all unique remainders (effectiveCoefficient * k) % moduloVal
  // will be explored due to the properties of modular arithmetic.
  for (let kIteration = 0; kIteration < moduloVal; kIteration++) {
    // Calculate the product of the effective coefficient and the current multiplier.
    const currentProductResult = effectiveCoefficient * kIteration;

    // Compute the remainder of this product when divided by the modulus.
    const actualComputedRemainder = currentProductResult % moduloVal;

    // If the actual computed remainder matches our normalized target remainder,
    // then a solution exists for this specific kIteration.
    if (actualComputedRemainder === normalizedTargetRemainder) {
      return true; // We found a valid 'k', so a solution exists.
    }
  }

  // If the loop completes without finding any matching 'k',
  // it means no solution exists for the given equation.
  return false;
}

/**
 * Primary function to process input string data.
 * It parses three numbers and then uses a helper to determine
 * if a specific modular congruence holds true.
 *
 * @param {string} rawInputString The entire input as a single string,
 *                                  expected to contain three space-separated integers.
 */
function processInputPayload(rawInputString) {
  // Split the incoming string into an array of string numbers based on spaces.
  const stringTokens = rawInputString.split(" ");

  // A basic validation to ensure we have enough input components.
  // If not, log an error and terminate the execution gracefully.
  if (stringTokens.length < 3) {
    console.error("Error: Insufficient data provided. Expected three numeric values.");
    return; // Exit function if input is malformed.
  }

  // Convert the string tokens into numerical values.
  // Using the unary plus operator or Number() is an alternative to parseInt().
  let valAlpha = Number(stringTokens[0]);
  const valBeta = Number(stringTokens[1]);
  const valGamma = Number(stringTokens[2]);

  // Invoke the modular equation solver with the parsed values.
  // The solver will handle internal normalizations and checks.
  const isCongruenceSatisfied = checkModularEquationSolution(
    valAlpha,    // The initial 'A' value.
    valBeta,     // The 'B' value (modulus).
    valGamma     // The 'C' value (target remainder).
  );

  // Based on the boolean result from the solver, output "YES" or "NO".
  // A ternary operator provides a concise way to express this conditional output.
  console.log(isCongruenceSatisfied ? "YES" : "NO");
}

// The following line is standard boilerplate for competitive programming environments
// that read input from standard input and pass it to the main processing function.
// Do not modify this section.
processInputPayload(require("fs").readFileSync("/dev/stdin", "utf8"));
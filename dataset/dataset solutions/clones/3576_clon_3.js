// This module encapsulates the logic for determining valid triplet combinations based on specific divisibility rules.

/**
 * Processes a raw input string containing two space-separated integers (N and K)
 * and calculates the count of unique triplets (a, b, c) where 1 <= a, b, c <= N
 * and (a+b), (b+c), and (c+a) are all perfectly divisible by K.
 *
 * @param {string} rawInputData The input string, typically from standard input.
 *                               Expected format: "N K" (e.g., "5 2").
 * @returns {number} The total count of such valid triplets. Returns 0 if input is invalid.
 */
function calculateTripletCount(rawInputData) {
  // Input validation: Ensure the input is a non-empty string.
  if (typeof rawInputData !== 'string' || rawInputData.trim().length === 0) {
    // In a real application, consider throwing an error or logging more verbosely.
    // For competitive programming, returning 0 on invalid input might be a common practice.
    return 0;
  }

  /**
   * Internal helper function to parse the numerical parameters from the input string.
   * Handles basic validation for the number of parts and their numerical values.
   * @param {string} dataString The string to parse.
   * @returns {{upperLimit: number, modulus: number}} An object containing the parsed N and K values.
   *                                                Returns {upperLimit: 0, modulus: 0} if parsing fails.
   */
  const parseInputParameters = (dataString) => {
    const numericParts = dataString.split(' ');

    // Ensure we have exactly two numeric parts.
    if (numericParts.length !== 2) {
      return { upperLimit: 0, modulus: 0 };
    }

    const nValue = parseInt(numericParts[0], 10);
    const kValue = parseInt(numericParts[1], 10);

    // Validate that N and K are positive integers.
    if (isNaN(nValue) || isNaN(kValue) || nValue < 1 || kValue < 1) {
      return { upperLimit: 0, modulus: 0 };
    }

    return { upperLimit: nValue, modulus: kValue };
  };

  const { upperLimit, modulus } = parseInputParameters(rawInputData);

  // Early exit if parameters were not successfully parsed or validated.
  if (upperLimit === 0 || modulus === 0) {
    return 0;
  }

  let successfulCombinations = 0; // This variable will store the final count.

  /**
   * Internal helper function to verify the divisibility conditions for a given triplet.
   * @param {number} valA The first integer in the triplet.
   * @param {number} valB The second integer in the triplet.
   * @param {number} valC The third integer in the triplet.
   * @param {number} divBy The modulus value (K).
   * @returns {boolean} True if all three sum conditions are met, false otherwise.
   */
  const verifySumConditions = (valA, valB, valC, divBy) => {
    // Calculate intermediate sums for clarity.
    const sumAB = valA + valB;
    const sumBC = valB + valC;
    const sumCA = valC + valA;

    // Check each condition individually.
    const firstCondition = (sumAB % divBy === 0);
    const secondCondition = (sumBC % divBy === 0);
    const thirdCondition = (sumCA % divBy === 0);

    // All conditions must be true for the triplet to be valid.
    return firstCondition && secondCondition && thirdCondition;
  };

  // Iterate through all possible integer values for 'a', 'b', and 'c'
  // from 1 up to the specified upperLimit (N).
  for (let firstVal = 1; firstVal <= upperLimit; ++firstVal) {
    for (let secondVal = 1; secondVal <= upperLimit; ++secondVal) {
      for (let thirdVal = 1; thirdVal <= upperLimit; ++thirdVal) {
        // If the current triplet satisfies the divisibility requirements,
        // increment our counter.
        if (verifySumConditions(firstVal, secondVal, thirdVal, modulus)) {
          successfulCombinations++;
        }
      }
    }
  }

  // Return the total count of triplets that met the criteria.
  return successfulCombinations;
}

// Standard competitive programming boilerplate for reading input and calling the main logic.
// This part is generally fixed and not subject to cloning in the same way the core logic is.
const inputDataString = require("fs").readFileSync("/dev/stdin", "utf8");
const finalComputedResult = calculateTripletCount(inputDataString);
console.log(finalComputedResult);
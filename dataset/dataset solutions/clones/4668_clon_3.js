// This script determines the minimum possible string length for the larger
// component of any factor pair (A, B) of a given input number N, such that A * B = N.

// --- Input Processing Section ---
// Acquire raw input from standard input, typically used in competitive programming environments.
// The input is expected to be a single numerical value on the first line.
const rawInputBuffer = require('node:fs').readFileSync('/dev/stdin', 'utf8');

// Normalize the input: remove leading/trailing whitespace and split the content into an array of lines.
const inputLines = rawInputBuffer.trim().split('\n');

// Extract the primary numerical value from the first line of input.
// Using parseInt with radix 10 ensures explicit conversion to an integer.
const primaryInteger = parseInt(inputLines.shift(), 10);

// Implement a basic validation check for the input number.
// It must be a positive integer to proceed with factor computations.
if (Number.isNaN(primaryInteger) || primaryInteger <= 0 || !Number.isInteger(primaryInteger)) {
  // If the input is invalid, log an error message and terminate the process.
  console.error("Error: The provided input must be a positive integer.");
  process.exit(1); // Exit with a non-zero status code to indicate an error.
}

// --- Core Logic: Factor Calculation ---
/**
 * Calculates all unique positive integer factors (divisors) for a given number.
 * The resulting factors are returned in a numerically sorted array.
 * @param {number} valueToFactorize - The positive integer for which factors are to be found.
 * @returns {number[]} An array containing all unique positive factors, sorted in ascending order.
 */
const retrieveAllFactors = (valueToFactorize) => {
  // Guard clause to handle invalid input to the function itself.
  if (valueToFactorize <= 0 || !Number.isInteger(valueToFactorize)) {
    // For invalid inputs, return an empty array as there are no positive integer factors.
    return [];
  }

  // Utilize a Set to efficiently store factors and automatically handle duplicates.
  // This is particularly useful for perfect squares where i and n/i would be the same.
  const uniqueFactors = new Set();

  // Optimized iteration: factors always come in pairs (i, n/i).
  // We only need to check up to the square root of the number.
  const iterationLimit = Math.sqrt(valueToFactorize);
  for (let currentCandidate = 1; currentCandidate <= iterationLimit; currentCandidate++) {
    // If 'currentCandidate' perfectly divides 'valueToFactorize', then it's a factor.
    if (valueToFactorize % currentCandidate === 0) {
      // Add the current candidate factor to our set.
      uniqueFactors.add(currentCandidate);
      // Also add its corresponding complementary factor (valueToFactorize / currentCandidate).
      uniqueFactors.add(valueToFactorize / currentCandidate);
    }
  }

  // Convert the Set of unique factors into an Array and sort it numerically.
  return Array.from(uniqueFactors).sort((firstVal, secondVal) => firstVal - secondVal);
};

// Compute the complete list of factors for our validated primary input number.
const numericalFactors = retrieveAllFactors(primaryInteger);

// --- Determine Minimum Maximum Length ---
// Initialize a variable to track the smallest maximum length encountered.
// Setting it to Infinity ensures that the first valid length found will always be smaller.
let smallestMaxFactorLength = Infinity;

// Iterate through each factor in the sorted list to form factor pairs (A, B).
// For each factor 'currentDivisor', its complement is 'primaryInteger / currentDivisor'.
for (const currentDivisor of numericalFactors) {
  // Calculate the complementary factor for the current divisor.
  const complementaryDivisor = primaryInteger / currentDivisor;

  // Convert both factors in the pair to their string representations to determine their lengths.
  const stringRepresentationOfCurrent = String(currentDivisor);
  const stringRepresentationOfComplementary = String(complementaryDivisor);

  // Find the length of the longer string among the current factor pair.
  const currentPairMaxLen = Math.max(
    stringRepresentationOfCurrent.length,
    stringRepresentationOfComplementary.length
  );

  // Update 'smallestMaxFactorLength' if the current pair's maximum length is smaller.
  smallestMaxFactorLength = Math.min(smallestMaxFactorLength, currentPairMaxLen);
}

// --- Output Result ---
// Display the final calculated minimum maximum factor length to standard output.
console.log(smallestMaxFactorLength);
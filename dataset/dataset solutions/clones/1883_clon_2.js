const { readFileSync: retrieveFileContent } = require("fs");
const rawData = retrieveFileContent("/dev/stdin", "utf8");

/**
 * Computes modular exponentiation (base^exponent % modulus).
 * This function efficiently calculates (base^exponent) mod primeMod.
 * @param {bigint} baseVal - The base number for the exponentiation.
 * @param {bigint} exponent - The exponent to which the base is raised.
 * @returns {bigint} The result of the modular exponentiation.
 */
function power(baseVal, exponent) {
  let computedVal = BigInt(1); // Initialize accumulator for the result.
  // Loop continues as long as the exponent is greater than zero.
  while (exponent > BigInt(0)) {
    // If the least significant bit of the exponent is 1,
    // multiply the current result by the base.
    if ((exponent & BigInt(1)) === BigInt(1)) {
      computedVal = (computedVal * baseVal) % primeMod;
    }
    // Square the base and reduce it modulo primeMod for the next iteration.
    baseVal = (baseVal * baseVal) % primeMod;
    // Right-shift the exponent by 1 bit, effectively dividing it by 2.
    exponent >>= BigInt(1);
  }
  return computedVal; // Return the final calculated value.
}

/**
 * Calculates the modular multiplicative inverse of a number
 * using Fermat's Little Theorem. This method is valid for prime moduli.
 * @param {bigint} numValue - The number for which to find the inverse.
 * @returns {bigint} The modular inverse of numValue with respect to primeMod.
 */
function getInverse(numValue) {
  // The multiplicative inverse of 1 modulo any modulus is always 1.
  if (numValue === BigInt(1)) {
    return BigInt(1);
  }
  // According to Fermat's Little Theorem, a^(p-2) mod p is the inverse of a mod p,
  // where p is a prime number.
  return power(numValue, primeMod - BigInt(2));
}

// Define the large prime modulus constant used throughout calculations.
const primeMod = BigInt(998244353);

// This immediately invoked function expression (IIFE) encapsulates the main program logic.
(function (inputData) {
  // Split the entire input string into an array of individual lines.
  const allLines = inputData.split("\n");

  // Parse the first line of input to extract three BigInt parameters: countN, countM, and limitK.
  let [countN, countM, limitK] = allLines[0]
    .split(" ")
    .map((str) => BigInt(str));

  let totalSum = BigInt(0); // Accumulator for the final computed sum.
  let termOne = BigInt(1); // First intermediate product accumulator, similar to a factorial.
  let termTwo = BigInt(1); // Second intermediate product accumulator, involving N and k.

  // Iterate from 0 up to and including the value of limitK.
  for (let iterIdx = BigInt(0); iterIdx <= limitK; iterIdx++) {
    // Update termOne: termOne = termOne * (iterIdx || 1n).
    // The `|| BigInt(1)` handles the case where iterIdx is 0.
    termOne = termOne * (iterIdx || BigInt(1));

    // Update termTwo: termTwo = termTwo * (N - (k || (N - 1n))) % mod.
    // This calculation involves N and the current iteration index, ensuring modular reduction.
    termTwo = (termTwo * (countN - (iterIdx || (countN - BigInt(1))))) % primeMod;

    // Calculate a temporary product: (termTwo * inverse(termOne)) % primeMod.
    // Ensure that intermediate results are also reduced modulo primeMod.
    let tempProduct = (termTwo * getInverse(termOne)) % primeMod;

    // Add to the total sum:
    // The expression is: tempProduct * power(countM-1, countN-(iterIdx+1)) * countM % primeMod.
    // All additions to totalSum are also reduced modulo primeMod.
    totalSum =
      (totalSum +
        (tempProduct *
          power(countM - BigInt(1), countN - (iterIdx + BigInt(1))) *
          countM) %
          primeMod) %
      primeMod;
  }

  // Print the final calculated sum, ensuring it's within the modulus range
  // and converted to a string for output.
  console.log((totalSum % primeMod).toString());
})(rawData); // Pass the raw input data into the IIFE.
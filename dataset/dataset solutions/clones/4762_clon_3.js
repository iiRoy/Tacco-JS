"use strict";

// Utility to read data from standard input.
const readInputString = () => {
  const fileSystem = require("fs"); // Moved 'fs' require to a constant.
  return fileSystem.readFileSync("/dev/stdin", "utf8").trim();
};

// Displays the provided content to the standard output.
const displayResult = (contentToOutput) => {
  console.log(String(contentToOutput)); // Explicitly converting to String.
};

/**
 * Computes the total number of divisors of the factorial of a given number N,
 * modulo a large prime. This is achieved by finding the prime factorization
 * of N! (which involves summing the exponents of each prime factor from 1 to N),
 * and then calculating the product of (exponent + 1) for each unique prime factor.
 *
 * @param {string} rawInputContent - The raw string input, expected to be a single positive integer.
 */
const calculateDivisorProduct = (rawInputContent) => {
  const targetNumber = Number(rawInputContent); // Inlined conversion from original myconv(input, 1).

  // Input validation: ensure the input is a positive integer.
  if (isNaN(targetNumber) || targetNumber < 1 || !Number.isInteger(targetNumber)) {
    throw new Error("Input must be a positive integer.");
  }

  // An array to store the cumulative count of occurrences for each prime factor.
  // The index represents the potential prime number, and the value is its total exponent.
  const primeFactorCounts = Array.from({ length: targetNumber + 1 }, () => 0);

  const modulusValue = 1000000007; // The modulo constant.

  // Iterate through each integer from 2 up to the target number.
  // For each integer, find its prime factors and increment their counts in primeFactorCounts.
  for (let currentInteger = 2; currentInteger <= targetNumber; currentInteger++) {
    // The original code included 'if(i == 1){ list[1] = 1; continue; }'.
    // This line has been removed as list[1] is never used in the final product calculation (loop starts from index 2),
    // making it a non-essential statement.

    let tempNumToFactorize = currentInteger; // Temporary variable for factorization.

    // Efficiently find prime factors for 'tempNumToFactorize'.
    let potentialDivisor = 2;
    while (tempNumToFactorize > 1) {
      if (tempNumToFactorize % potentialDivisor === 0) {
        primeFactorCounts[potentialDivisor]++;
        tempNumToFactorize /= potentialDivisor;
      } else {
        // Optimization: After checking 2, only check odd numbers as potential divisors.
        if (potentialDivisor === 2) {
          potentialDivisor++; // Move from 2 to 3.
        } else {
          potentialDivisor += 2; // Move to the next odd number.
        }

        // Optimization: If the square of the current potentialDivisor exceeds the remaining
        // number to factorize, then the remaining number itself must be prime.
        if (potentialDivisor * potentialDivisor > tempNumToFactorize && tempNumToFactorize > 1) {
          primeFactorCounts[tempNumToFactorize]++; // The remaining number is a prime factor.
          break; // Exit the inner while loop as factorization for this number is complete.
        }
      }
    }
  }

  // Initialize the final product to 1. This will store the product of (exponent + 1) for each prime.
  let finalProductResult = 1;

  // Iterate through the collected prime factor counts.
  // We start from index 2 because 1 is not a prime factor.
  for (let currentPrimeIndex = 2; currentPrimeIndex < primeFactorCounts.length; currentPrimeIndex++) {
    const primeExponent = primeFactorCounts[currentPrimeIndex]; // Helper variable for clarity.

    if (primeExponent > 0) { // Only consider primes that actually appeared as factors.
      const term = primeExponent + 1; // Intermediate step: exponent + 1.
      finalProductResult = (finalProductResult * term) % modulusValue;
    }
  }

  // The original code had a commented-out line `//myout(list);` which has been removed.
  displayResult(finalProductResult); // Output the final computed result.
};

// Standard boilerplate for Node.js scripts to ensure the main function
// is called only when the script is executed directly.
if (require.main === module) {
  try {
    const rawInput = readInputString();
    calculateDivisorProduct(rawInput);
  } catch (error) {
    console.error("An error occurred during execution:", error.message);
    process.exit(1); // Exit with an error code if an error occurs.
  }
}
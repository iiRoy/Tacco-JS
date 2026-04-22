"use strict";

/**
 * Primary handler for the application's logic.
 * This function is responsible for parsing input, delegating calculations,
 * and presenting the final result.
 * @param {string} incomingData - The raw string data received, typically from standard input.
 */
function processApplicationData(incomingData) {
  // Parse the input string into an array of non-empty, trimmed lines.
  const cleanedLines = incomingData
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  // Validate that input was actually provided.
  if (cleanedLines.length === 0) {
    // In a real application, one might log an error or throw an exception.
    // For this context, silently exiting or returning is sufficient.
    return;
  }

  // Convert the first line of input into a numerical limit for calculations.
  let numericLimit = Number(cleanedLines[0]);

  // Perform basic validation on the numerical input.
  // Ensure it's a valid number and positive, as factorization usually applies to positive integers.
  if (isNaN(numericLimit) || numericLimit < 1) {
    // Handle invalid numerical input gracefully.
    return;
  }

  /**
   * Determines the cumulative count of each prime factor for all integers
   * from 2 up to a specified maximum value. This effectively calculates
   * the prime factorization exponents for `maximumValue!`.
   * @param {number} maximumValue - The upper bound for the range of integers to factorize.
   * @returns {number[]} An array where `resultArray[p]` holds the total exponent of prime `p`.
   */
  function derivePrimeFactorExponents(maximumValue) {
    // If the maximum value is less than 2, there are no prime factors to count.
    if (maximumValue < 2) {
      return new Array(maximumValue + 1).fill(0);
    }

    // Initialize an array to store the sum of exponents for each prime.
    // The size is `maximumValue + 1` to allow direct indexing by prime number.
    const exponentSums = new Array(maximumValue + 1).fill(0);

    // Iterate through each integer from 2 up to the maximum value.
    for (let currentInteger = 2; currentInteger <= maximumValue; ++currentInteger) {
      let workingNumber = currentInteger; // A temporary variable to be divided.

      // Find and count prime factors for the `workingNumber`.
      // The inner loop iterates through potential divisors.
      for (let potentialDivisor = 2; potentialDivisor <= workingNumber; ++potentialDivisor) {
        // While the potential divisor perfectly divides `workingNumber`,
        // it's a prime factor. Increment its count and reduce `workingNumber`.
        while (workingNumber % potentialDivisor === 0) {
          exponentSums[potentialDivisor]++;
          workingNumber /= potentialDivisor;
        }
      }
    }
    return exponentSums;
  }

  /**
   * Counts how many elements in a given array are greater than or equal to a specified threshold.
   * @param {number} minimumThreshold - The lower bound for element values to be counted.
   * @param {number[]} targetCollection - The array to iterate through.
   * @returns {number} The total count of elements meeting the threshold.
   */
  function countValuesMeetingThreshold(minimumThreshold, targetCollection) {
    let qualifiedCount = 0; // Initialize counter for matching elements.

    // Basic validation for the input array.
    if (!Array.isArray(targetCollection) || targetCollection.length === 0) {
      return 0;
    }

    // Iterate through each value in the collection.
    // Using a for...of loop for conciseness.
    for (const itemValue of targetCollection) {
      if (itemValue >= minimumThreshold) {
        qualifiedCount++; // Increment if the value meets the threshold.
      }
    }
    return qualifiedCount;
  }

  // Calculate the total prime factor exponents for `numericLimit!`.
  const aggregatedPrimeExponents = derivePrimeFactorExponents(numericLimit);

  // Now, calculate the counts of primes whose total exponents meet specific criteria.
  // These criteria correspond to finding numbers with exactly 75 divisors.
  // A number N has D divisors if N = p1^a1 * p2^a2 * ... * pk^ak, then D = (a1+1)(a2+1)...(ak+1).
  // For D=75, possible exponent sets (a+1) are:
  // 1. (74+1) = 75  => one prime p^74
  // 2. (24+1)(2+1) = 25 * 3 = 75 => two primes p1^24 * p2^2
  // 3. (14+1)(4+1) = 15 * 5 = 75 => two primes p1^14 * p2^4
  // 4. (4+1)(4+1)(2+1) = 5 * 5 * 3 = 75 => three primes p1^4 * p2^4 * p3^2

  const countPrimesWithExp74OrMore = countValuesMeetingThreshold(74, aggregatedPrimeExponents);
  const countPrimesWithExp24OrMore = countValuesMeetingThreshold(24, aggregatedPrimeExponents);
  const countPrimesWithExp14OrMore = countValuesMeetingThreshold(14, aggregatedPrimeExponents);
  const countPrimesWithExp4OrMore = countValuesMeetingThreshold(4, aggregatedPrimeExponents);
  const countPrimesWithExp2OrMore = countValuesMeetingThreshold(2, aggregatedPrimeExponents);

  // Calculate combinations for each case contributing to 75 divisors.

  // Case A: One prime factor with an exponent of at least 74 (e.g., p^74).
  const contributionFromSinglePrime = countPrimesWithExp74OrMore;

  // Case B: Two distinct prime factors: one with exponent >= 24, another with exponent >= 2 (e.g., p1^24 * p2^2).
  // We choose one prime from `countPrimesWithExp24OrMore` and another *different* prime
  // from `countPrimesWithExp2OrMore`.
  const contributionFromTwoPrimes_24_2 = countPrimesWithExp24OrMore * (countPrimesWithExp2OrMore - 1);

  // Case C: Two distinct prime factors: one with exponent >= 14, another with exponent >= 4 (e.g., p1^14 * p2^4).
  // Similar logic as Case B.
  const contributionFromTwoPrimes_14_4 = countPrimesWithExp14OrMore * (countPrimesWithExp4OrMore - 1);

  // Case D: Three distinct prime factors: two with exponent >= 4, and one with exponent >= 2 (e.g., p1^4 * p2^4 * p3^2).
  // First, calculate combinations for choosing two distinct primes with exponent >= 4.
  // C(n, 2) = n * (n - 1) / 2
  const combinationsOfTwoFours = (countPrimesWithExp4OrMore * (countPrimesWithExp4OrMore - 1)) / 2;
  // Then, multiply by the number of remaining distinct primes with exponent >= 2.
  const contributionFromThreePrimes_4_4_2 = combinationsOfTwoFours * (countPrimesWithExp2OrMore - 2);

  // Sum all the contributions to get the final answer.
  const finalComputedResult =
    contributionFromSinglePrime +
    contributionFromTwoPrimes_24_2 +
    contributionFromTwoPrimes_14_4 +
    contributionFromThreePrimes_4_4_2;

  // Output the final result to the console.
  console.log(finalComputedResult);
}

// Execute the main processing function by reading input from standard input.
processApplicationData(require("fs").readFileSync("/dev/stdin", "utf8"));
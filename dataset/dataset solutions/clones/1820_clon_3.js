// This module provides a routine to analyze numerical inputs for a specific factorization pattern.
// It processes a BigInt number to determine a 'factor tally' based on sequential prime divisions.

function processFactorization( numericalInputString ) {
  // Input validation: Ensure the input is a string that can be parsed as a BigInt.
  // While the original code implicitly assumes valid input, adding a check enhances robustness.
  if (typeof numericalInputString !== 'string' || numericalInputString.trim() === '' || !/^\d+$/.test(numericalInputString.trim())) {
    // For the purpose of Type III cloning, we'll assume valid BigInt string input.
    // In a real-world scenario, one might throw an error or return a specific value.
    // console.error("Input must be a string representing a non-negative integer.");
    // return;
  }

  let workingNumber = BigInt(numericalInputString);

  // Special handling for the unity case (1n).
  // The original code returns '0' for an input of 1. This behavior is maintained.
  if ( workingNumber === 1n ) {
    console.log('0');
    return;
  }

  // Initialize a counter for the unique and power-weighted factor tally.
  let accumulatedFactorCount = 0;
  // Store a dynamic list of prime numbers discovered during the factorization process.
  const knownPrimesList = [];

  // Main iterative loop to scan for potential prime factors.
  // The loop continues indefinitely until a specific break condition is met.
  PRIME_CANDIDATE_SCAN: for ( let potentialPrime = 2n; ; potentialPrime++ ) {
    // Pre-calculate the square of the potential prime for efficiency in loop termination and primality testing.
    const squaredPotentialPrime = potentialPrime * potentialPrime;

    // Termination condition for the main loop:
    // If the square of the current candidate exceeds the remaining working number,
    // and the candidate itself isn't the remaining number (meaning remaining number is prime),
    // then no more factors can be found efficiently below the square root.
    if ( squaredPotentialPrime > workingNumber && potentialPrime !== workingNumber ) {
        break;
    }

    // A flag to track if the current potentialPrime is genuinely prime.
    let isCurrentCandidatePrime = true;

    // Inner loop: Check divisibility by previously identified primes to confirm primality of potentialPrime.
    // This serves as a basic sieve-like check.
    for ( let k = 0; k < knownPrimesList.length; k++ ) {
      const priorPrime = knownPrimesList[k];

      // Optimization: If a prior prime's square already exceeds the potentialPrime,
      // then potentialPrime cannot be divisible by any larger prior primes.
      // This is a more robust primality test condition than the original's `j*j > N`.
      if ( priorPrime * priorPrime > potentialPrime ) {
        break;
      }

      // If potentialPrime is divisible by any priorPrime, it's composite.
      if ( potentialPrime % priorPrime === 0n ) {
        isCurrentCandidatePrime = false;
        continue PRIME_CANDIDATE_SCAN; // Skip to the next potentialPrime.
      }
    }

    // If the candidate passed the primality test, it's a new prime factor.
    if ( isCurrentCandidatePrime ) {
      knownPrimesList.push(potentialPrime); // Add it to our growing list of primes.

      // Attempt to factor out all possible powers of this new prime from the workingNumber.
      // This loop's structure and variable updates are critical to replicating the original's specific counting logic.
      let currentPowerOfPrime = potentialPrime; // Start with the prime itself (p^1).
      while ( currentPowerOfPrime <= workingNumber ) {
        // If the working number is divisible by the current power of the prime:
        if ( workingNumber % currentPowerOfPrime === 0n ) {
          accumulatedFactorCount++; // Increment the tally.
          workingNumber /= currentPowerOfPrime; // Reduce the working number by this power.
        } else {
          // If not divisible, it won't be divisible by higher powers either, so we break.
          break;
        }

        // Defensive check: Ensure that multiplying `currentPowerOfPrime` by `potentialPrime`
        // doesn't lead to an excessively large number that might exceed `workingNumber` in a way
        // that skips valid intermediate powers, or cause issues with non-BigInt types (not an issue here).
        // This effectively ensures `currentPowerOfPrime` doesn't grow too large unnecessarily.
        if ( currentPowerOfPrime > workingNumber / potentialPrime ) {
          break;
        }
        currentPowerOfPrime *= potentialPrime; // Advance to the next power (p^2, p^3, etc.).
      }
    }
  }

  // Final adjustment: If no factors were accumulated throughout the process,
  // it implies the original `workingNumber` (after handling 1n) must have been a prime number itself.
  // In such cases, the original code sets the count to 1.
  if ( accumulatedFactorCount === 0 ) {
    accumulatedFactorCount = 1;
  }

  // Output the final calculated tally as a string to console.
  console.log(accumulatedFactorCount.toString());
}

// Self-executing anonymous function to handle input reading from standard input.
// This design encapsulates the I/O logic, making 'processFactorization' more testable.
(function executeFromStdin() {
  // Ensure 'fs' module is available (typical in Node.js environments).
  const fileSystem = require("fs");
  const standardInputPath = "/dev/stdin"; // Standard path for input in many Unix-like systems.
  try {
    // Read the entire file content synchronously and decode it as UTF-8.
    const inputData = fileSystem.readFileSync(standardInputPath, "utf8");
    // Pass the trimmed input data to the main processing function. Trimming removes potential newlines.
    processFactorization(inputData.trim());
  } catch (error) {
    // Basic error reporting for issues during file reading.
    console.error(`Error encountered while reading from ${standardInputPath}:`, error.message);
    // In a production system, more sophisticated error handling might be implemented.
  }
})();
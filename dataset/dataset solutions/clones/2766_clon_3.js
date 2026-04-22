// This module processes input data to determine a specific remainder value.
// It aims to find the smallest result of (firstFactor * secondFactor) % 2019
// where the factors are within a given range [lowerBoundary, upperBoundary].
// The overall logic structure, including specific conditional checks and outputs,
// is carefully preserved to maintain functional similarity with the original source.
function ProcessInputDataSegment(rawTextualData) {
  // Define the constant modulus value used throughout the calculations.
  const CALCULATION_MODULUS = 2019;

  // Split the entire input string by newline characters.
  const contentLines = rawTextualData.split("\n");
  
  // Extract the first line, which contains the numerical parameters, and split it by spaces.
  const numericalTokens = contentLines[0].split(" ");

  // Parse the lower and upper bounds. Using the unary plus operator is an efficient
  // way to convert string tokens to numbers in JavaScript.
  const lowerBoundary = +numericalTokens[0]; // Equivalent to Number(numericalTokens[0])
  const upperBoundary = +numericalTokens[1]; // Equivalent to Number(numericalTokens[1])

  // Initialize a variable to store the minimum remainder found.
  // It's set to the modulus value, as any valid remainder (0 to CALCULATION_MODULUS-1)
  // will inherently be smaller than or equal to this initial value.
  let minimalModResult = CALCULATION_MODULUS; 

  // Compute the width of the numerical range [lowerBoundary, upperBoundary].
  const rangeSpan = upperBoundary - lowerBoundary;

  // --- Core Conditional Logic Flow ---

  // First major condition: Check if the product of the boundaries exceeds the modulus.
  // This serves as a primary branching point, indicative of the original algorithm's design.
  if (lowerBoundary * upperBoundary > CALCULATION_MODULUS) {
    // Nested condition: If the range span is smaller than the modulus,
    // a brute-force iteration through all possible pairs is necessary.
    if (rangeSpan < CALCULATION_MODULUS) {
      // Outer loop: iterates 'firstFactor' from 'lowerBoundary' up to 'upperBoundary - 1'.
      for (let firstFactor = lowerBoundary; firstFactor < upperBoundary; firstFactor++) {
        // Inner loop: iterates 'secondFactor' from 'firstFactor + 1' up to 'upperBoundary'.
        for (let secondFactor = firstFactor + 1; secondFactor <= upperBoundary; secondFactor++) {
          // Calculate the product of the two factors and then its remainder with CALCULATION_MODULUS.
          const currentProductRemainder = (firstFactor * secondFactor) % CALCULATION_MODULUS;

          // If the current remainder is 0, it's the absolute minimum possible.
          // In this case, we update the minimal result and can terminate the inner loop early.
          if (currentProductRemainder === 0) {
            minimalModResult = 0;
            break; // Exits the inner 'secondFactor' loop.
          } else {
            // Otherwise, update minimalModResult if a smaller positive remainder is found.
            if (currentProductRemainder < minimalModResult) {
              minimalModResult = currentProductRemainder;
            }
          }
        }
        // Additional check: If minimalModResult has already reached 0 (the absolute minimum),
        // there's no need to continue with further outer loop iterations.
        if (minimalModResult === 0) {
          break; // Exits the outer 'firstFactor' loop.
        }
      }
      // Output the final determined minimum remainder for this branch.
      console.log(minimalModResult);
    } else {
      // Alternative for the nested condition: If the range span is wide enough (>= CALCULATION_MODULUS),
      // it's guaranteed that a pair (i, j) exists whose product is a multiple of CALCULATION_MODULUS.
      // Thus, the minimum remainder will be 0.
      console.log(0);
    }
  } else {
    // Second major condition: If the product of the boundaries does not exceed the modulus.
    // This branch typically covers cases where 'lowerBoundary' and 'upperBoundary' are relatively small.
    // The original code has a specific output here: it prints the product of 'lowerBoundary'
    // and 'lowerBoundary + 1' directly, rather than its modulo. This specific behavior,
    // even if it appears to be an edge case or a slight deviation from a strict modulo problem,
    // is preserved to maintain the exact functionality of the source code.
    console.log(lowerBoundary * (lowerBoundary + 1));
  }
}

// Invoke the main processing function by reading input from standard input.
// This is a common practice for competitive programming challenges in Node.js.
ProcessInputDataSegment(require("fs").readFileSync("/dev/stdin", "utf8"));
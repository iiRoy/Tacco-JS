"use strict";

/**
 * Processes input lines to find the count of unique digit permutations
 * between a specified start and end value.
 * A "unique digit permutation" here means a number of 'numDigits' length
 * where each digit from 1 to 'numDigits' appears exactly once, and no '0' is present.
 *
 * @param {string[]} inputLines - An array of strings from standard input.
 *                                  inputLines[0]: Number of digits (N).
 *                                  inputLines[1]: Starting permutation (P).
 *                                  inputLines[2]: Ending permutation (Q).
 */
function processInputData(inputLines) {
  // Validate and parse the number of digits (N) from the first input line.
  const numDigitsString = inputLines[0].trim();
  const numDigits = Number.parseInt(numDigitsString, 10);

  // Add a guard clause for the valid range of N (2 to 8, as implied by the fixed upper bound 87654321).
  if (Number.isNaN(numDigits) || numDigits < 2 || numDigits > 8) {
    console.error("Error: The number of digits (N) must be an integer between 2 and 8.");
    return; // Exit if input is invalid.
  }

  // Parse start and end values from the input, cleaning potential spaces.
  const rawStartValue = inputLines[1].trim().replace(/\s/g, '');
  const rawEndValue = inputLines[2].trim().replace(/\s/g, '');

  let startPermutation = Number.parseInt(rawStartValue, 10);
  let endPermutation = Number.parseInt(rawEndValue, 10);

  // Validate that parsed start and end values are indeed numbers.
  if (Number.isNaN(startPermutation) || Number.isNaN(endPermutation)) {
    console.error("Error: Start or end permutation values are invalid numbers.");
    return; // Exit if input is invalid.
  }

  // Pre-defined minimum N-digit numbers for the search loop's lower bound.
  // These are 1-based permutations (1, 12, 123, etc.).
  // Index 0 and 1 are intentionally left unused to align with 'numDigits' values (N=2 at index 2).
  const minimumNdigitStarts = [
    0,         // Placeholder for N=0
    0,         // Placeholder for N=1
    12,        // Smallest 2-digit number using 1,2
    123,       // Smallest 3-digit number using 1,2,3
    1234,      // Smallest 4-digit number using 1,2,3,4
    12345,     // Smallest 5-digit number using 1,2,3,4,5
    123456,    // Smallest 6-digit number using 1,2,3,4,5,6
    1234567,   // Smallest 7-digit number using 1,2,3,4,5,6,7
    12345678   // Smallest 8-digit number using 1,2,3,4,5,6,7,8
  ];

  // Determine the effective lower bound for the main number search loop.
  // The original code used start[n-2], which corresponds to minimumNdigitStarts[numDigits].
  const lowerSearchBound = minimumNdigitStarts[numDigits];
  // The absolute upper bound for numbers considered, based on original code's fixed limit.
  const upperSearchBound = 87654321; // Represents the largest 8-digit permutation of 1-8.

  // If start and end permutations are identical, no numbers are "between" them, so the count is zero.
  if (startPermutation === endPermutation) {
    console.log(0);
    return; // Exit early.
  }

  // Ensure startPermutation is always less than or equal to endPermutation for correct iteration range.
  // This uses array destructuring for a clean swap.
  if (startPermutation > endPermutation) {
    [startPermutation, endPermutation] = [endPermutation, startPermutation];
  }

  let countedPermutations = 0; // Accumulator for valid permutations found within the specified range.
  let activeCountingPhase = false; // Flag to indicate if we are currently within the [startPermutation, endPermutation] range.

  // Iterate through all possible number candidates within the defined search space.
  // The loop starts from the smallest N-digit number and goes up to the maximum 8-digit permutation.
  for (let currentCandidateNumber = lowerSearchBound; currentCandidateNumber <= upperSearchBound; ++currentCandidateNumber) {

    // Activate the counting phase when the current candidate matches the start permutation.
    if (currentCandidateNumber === startPermutation) {
      activeCountingPhase = true;
    }

    // Only process candidates for permutation validation if we are in the active counting phase.
    if (activeCountingPhase) {
      const candidateAsString = String(currentCandidateNumber);

      // Only consider numbers that have the exact 'numDigits' length for validation.
      if (candidateAsString.length === numDigits) {
        let isCandidateValid = true; // Assume the candidate is valid until a rule is violated.
        // Array to track digit frequencies (1-based indexing for digits 1 to numDigits).
        const digitFrequencies = new Array(numDigits + 1).fill(0);

        // First, check for the presence of '0', which is not allowed in these specific permutations.
        if (candidateAsString.includes('0')) {
          isCandidateValid = false;
        } else {
          // Iterate over each character (digit) in the number string to validate.
          for (let digitChar of candidateAsString) {
            const currentDigit = Number.parseInt(digitChar, 10);

            // Check if the digit is outside the allowed range (1 to numDigits)
            // or if it has already appeared (violates the unique digit rule).
            if (currentDigit > numDigits || currentDigit < 1 || digitFrequencies[currentDigit] > 0) {
              isCandidateValid = false;
              break; // No need to check further digits for this candidate; it's already invalid.
            }
            digitFrequencies[currentDigit]++; // Mark this digit as seen.
          }
        }

        // If the candidate passed all validation checks, increment the total count.
        if (isCandidateValid) {
          countedPermutations++;
        }
      }
    }

    // Stop counting and print the result when the current candidate matches the end permutation.
    if (currentCandidateNumber === endPermutation) {
      console.log(countedPermutations);
      break; // Exit the loop as the target range has been fully processed.
    }
  }
}

// Read input from standard input, process it, and pass it to the main processing function.
processInputData(require('fs').readFileSync('/dev/stdin', 'utf8').trim().split("\n"));
const fileSystem = require('fs');

const standardInputPath = '/dev/stdin';

// Retrieve the raw content from the standard input stream.
// This operation reads the entire file synchronously, which is common in competitive programming.
const rawContentBuffer = fileSystem.readFileSync(standardInputPath, 'utf8');

// Normalize and segment the input into individual lines.
// First, remove any leading or trailing whitespace from the entire content.
// Then, split the processed content into an array of strings, using the newline character as a delimiter.
const inputLines = rawContentBuffer.trim().split('\n');

// Initialize a counter to keep track of the current line being processed, for context or debugging.
let currentLineNumber = 0;

// Iterate through each line of the parsed input.
// Using a modern 'for...of' loop for cleaner and more readable array iteration.
for (const lineEntry of inputLines) {
    // Increment the line counter for tracking.
    currentLineNumber++;

    // Parse the numerical parameters from the current line entry.
    // Each line is expected to contain two space-separated integers.
    const parsedParameters = lineEntry.split(' ').map(Number);

    // Use destructuring assignment for clearer variable representation of the input values.
    const [upperBoundN, targetSumX] = parsedParameters;

    // --- Termination Condition and Input Validation ---
    // Check for the specific termination signal (N=0 and X=0).
    // This is a common pattern in competitive programming to signify the end of test cases.
    if (upperBoundN === 0 && targetSumX === 0) {
        break; // Exit the main processing loop as requested by the problem.
    }

    // Validate if the parsed numbers are actually valid finite numbers.
    // If not, skip to the next input line to prevent erroneous calculations.
    if (isNaN(upperBoundN) || isNaN(targetSumX) || !Number.isFinite(upperBoundN) || !Number.isFinite(targetSumX)) {
        continue; // Proceed to the next line without processing the current invalid one.
    }

    // Initialize a mutable variable to store the count of successful combinations.
    let validCombinationCount = 0;

    // --- Algorithm Core: Finding Unique Triplets (a, b, c) ---
    // The objective is to find combinations of three distinct integers (a, b, c) such that:
    // 1. 1 <= a < b < c <= upperBoundN (all numbers are within bounds and distinct)
    // 2. a + b + c = targetSumX (their sum equals the desired target)

    // Outer loop for the first element 'a'.
    // 'a' can range from 1 up to (upperBoundN - 2) at most, to ensure there's room for 'b' and 'c' which must be larger.
    for (let firstVal = 1; firstVal <= upperBoundN; firstVal++) {

        // Middle loop for the second element 'b'.
        // 'b' must be strictly greater than 'a' (firstVal + 1) and up to (upperBoundN - 1).
        for (let secondVal = firstVal + 1; secondVal <= upperBoundN; secondVal++) {

            // Optimization: If the sum of 'a' and 'b' already equals or exceeds the target sum,
            // it's impossible to find a positive 'c' such that a + b + c = targetSumX
            // while also satisfying the condition c > b. We can break this inner loop early.
            if (firstVal + secondVal >= targetSumX) {
                break;
            }

            // Innermost loop for the third element 'c'.
            // 'c' must be strictly greater than 'b' (secondVal + 1) and up to upperBoundN.
            for (let thirdVal = secondVal + 1; thirdVal <= upperBoundN; thirdVal++) {

                // Check if the sum of the three distinct elements matches the desired target sum.
                if (firstVal + secondVal + thirdVal === targetSumX) {
                    validCombinationCount++; // Increment the counter if a valid triplet is found.
                }
                // Further optimization: If the sum of the current three elements already exceeds
                // the target sum, then increasing 'thirdVal' further will only make the sum larger.
                // Thus, we can break out of this innermost loop for 'thirdVal' for efficiency.
                else if (firstVal + secondVal + thirdVal > targetSumX) {
                    break;
                }
            }
        }
    }

    // Output the final count of valid combinations for the current set of parameters.
    // The output format is made more descriptive for better clarity.
    console.log(`Result for case N=${upperBoundN}, X=${targetSumX}: ${validCombinationCount} unique triplets.`);
}

// Script execution concludes after processing all valid input lines or encountering a termination signal.
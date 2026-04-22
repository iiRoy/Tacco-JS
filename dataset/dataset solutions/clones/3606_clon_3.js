'use strict'; // Enforces stricter parsing and error handling in the code.

/**
 * Accurately determines the total number of positive integer divisors for a given value.
 * This function incorporates an optimization by iterating only up to the square root of the number,
 * significantly improving performance for larger inputs. It also includes basic input validation.
 *
 * @param {number} valueToExamine - The positive integer for which the divisors are to be enumerated.
 * @returns {number} The aggregate count of positive divisors. Returns 0 if the input is not a valid positive integer.
 */
const countPositiveIntegerDivisors = (valueToExamine) => {
    // Preliminary validation: Ensure the input is an actual positive integer.
    // Non-integer, zero, or negative inputs are considered invalid for divisor counting.
    if (!Number.isInteger(valueToExamine) || valueToExamine <= 0) {
        // For invalid inputs, we define the count of positive divisors as zero.
        return 0;
    }

    let aggregateDivisorCount = 0; // Initialize a variable to accumulate the divisor count.
    const squareRootOfValue = Math.sqrt(valueToExamine); // Pre-calculate the square root for loop optimization.

    // The primary loop iterates from 1 up to the integer part of the square root of 'valueToExamine'.
    // This optimization is based on the property that if 'i' is a divisor, then 'valueToExamine / i' is also a divisor.
    for (let currentPossibleFactor = 1; currentPossibleFactor <= squareRootOfValue; currentPossibleFactor++) {
        // Check if 'currentPossibleFactor' perfectly divides 'valueToExamine'.
        if (valueToExamine % currentPossibleFactor === 0) {
            // If 'currentPossibleFactor' is a divisor, we must determine if it's the square root of 'valueToExamine'.
            if (currentPossibleFactor * currentPossibleFactor === valueToExamine) {
                // If it's a perfect square (e.g., for N=9, currentPossibleFactor=3),
                // the divisor (3) is counted only once to avoid duplication.
                aggregateDivisorCount += 1;
            } else {
                // Otherwise, 'currentPossibleFactor' and 'valueToExamine / currentPossibleFactor' are
                // two distinct divisors, so we add two to our count.
                aggregateDivisorCount += 2;
            }
        }
    }

    return aggregateDivisorCount; // Return the final tally of divisors.
};

/**
 * Orchestrates the primary logic: reads input, processes it, and outputs the result.
 * It identifies odd numbers within a specified range that possess precisely eight divisors.
 *
 * @param {string} rawInputStringData - The unprocessed input data, expected to be a string representation of a positive integer.
 */
const orchestrateCalculation = (rawInputStringData) => {
    // Phase 1: Input parsing and robust validation.
    const numericInputParsed = Number(rawInputStringData);

    // Validate if the parsed input is a valid positive integer.
    // If not, log an error message and gracefully exit the function.
    if (isNaN(numericInputParsed) || !Number.isInteger(numericInputParsed) || numericInputParsed < 1) {
        console.error("Input Error: The provided data is not a valid positive integer. Please ensure the input is a whole number greater than or equal to 1.");
        return; // Halt execution due to invalid input.
    }

    const upperBoundaryValue = numericInputParsed; // Assign the validated input to a descriptive constant.

    let qualifyingNumbersTally = 0; // Initialize a counter for numbers meeting the criteria.

    // Phase 2: Iteration and conditional logic application.
    // Loop through each integer starting from 1 up to the 'upperBoundaryValue'.
    for (let currentCandidateNumber = 1; currentCandidateNumber <= upperBoundaryValue; currentCandidateNumber++) {
        // Intermediate step: Determine if the current number is odd.
        const isCurrentNumberAnOddValue = (currentCandidateNumber % 2 !== 0);

        // Proceed only if the current number is odd, as per the problem specification.
        if (isCurrentNumberAnOddValue) {
            // Calculate the divisor count for the current odd number using our optimized function.
            const calculatedDivisorCount = countPositiveIntegerDivisors(currentCandidateNumber);

            // Check if the calculated divisor count exactly matches the target (eight).
            if (calculatedDivisorCount === 8) {
                // If the condition is met, increment the main tally.
                qualifyingNumbersTally = qualifyingNumbersTally + 1; // Explicit increment for clarity.
            }
        }
        // Even numbers are implicitly skipped by the 'if (isCurrentNumberAnOddValue)' block,
        // maintaining the original logic's intent of only processing odd numbers.
    }

    // Phase 3: Output the final result.
    console.log(qualifyingNumbersTally); // Display the total count of qualifying numbers.
};


// This critical section of code is responsible for standard input/output operations.
// It should remain unaltered to ensure the program correctly receives input and executes the main logic.
orchestrateCalculation(require("fs").readFileSync("/dev/stdin", "utf8"));
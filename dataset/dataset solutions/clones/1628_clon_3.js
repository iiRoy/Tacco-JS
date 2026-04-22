// --- File: seven_sequences_solver.js ---
// This JavaScript program is a Type III clone, extensively refactored and modified,
// from an original script designed to solve a classic number theory problem.
// The objective is to determine the length of the smallest positive integer
// that consists solely of the digit '7' (e.g., 7, 77, 777, etc.)
// and is perfectly divisible by a given input integer K.

// Utilizing Node.js's native file system module for reading standard input.
const fileSystemInterface = require('node:fs');

// A large prime modulus, frequently employed in competitive programming contexts
// to prevent integer overflows in modular arithmetic calculations.
// While not directly governing the primary divisibility check in this particular
// implementation, its presence reflects common practices and serves as a
// demonstration of a retained, albeit repurposed, global constant.
const globalArithmeticModulus = 1000000007; // Represents 10^9 + 7.

/**
 * Executes a modular multiplication operation between two operands.
 * This function is engineered to safely handle intermediate products that might
 * exceed JavaScript's `Number.MAX_SAFE_INTEGER` by temporarily converting
 * operands to `BigInt` for high-precision multiplication, before applying
 * the modulo and converting the result back to a standard `Number`.
 *
 * @param {number} firstOperand - The initial number for multiplication.
 * @param {number} secondOperand - The multiplier.
 * @param {number} divisorForModulus - The value to use as the modulus for the operation.
 * @returns {number} The result of `(firstOperand * secondOperand) % divisorForModulus`.
 * @throws {Error} If any input argument is not a valid positive number.
 */
const executeModularProduct = (firstOperand, secondOperand, divisorForModulus) => {
    // Input validation: ensuring all parameters are finite, positive numbers.
    if (typeof firstOperand !== 'number' || !Number.isFinite(firstOperand) || firstOperand < 0 ||
        typeof secondOperand !== 'number' || !Number.isFinite(secondOperand) || secondOperand < 0 ||
        typeof divisorForModulus !== 'number' || !Number.isFinite(divisorForModulus) || divisorForModulus <= 0) {
        throw new Error("Invalid arguments supplied to executeModularProduct: all must be non-negative numbers, modulus must be positive.");
    }
    // Perform the high-precision multiplication and modulo operation.
    return Number((BigInt(firstOperand) * BigInt(secondOperand)) % BigInt(divisorForModulus));
};

// Main operational logic enclosed within an Immediately Invoked Function Expression (IIFE).
// This pattern helps in managing scope and preventing global variable pollution.
(function performDivisibilitySearch() {
    // Retrieve the raw content from the standard input stream.
    // The '/dev/stdin' path is a convention for competitive programming platforms.
    const rawInputBufferContent = fileSystemInterface.readFileSync('/dev/stdin', { encoding: 'utf8', flag: 'r' });

    // Process the raw input: split into individual lines, accommodating both
    // Windows (`\r\n`) and Unix (`\n`) style line endings.
    // Empty lines are filtered out to ensure robust parsing.
    const parsedInputLines = rawInputBufferContent.split(/[\r\n]+/).filter(lineSegment => lineSegment.trim().length > 0);

    // Initial validation: check if any actual data was provided.
    if (parsedInputLines.length === 0) {
        console.error("Input stream is empty. No target divisor could be extracted.");
        console.log(-1); // Standard output for error or no solution.
        return;
    }

    // Parse the first line as the integer target divisor.
    // `Number()` constructor is used for flexible parsing, including leading/trailing whitespace.
    const potentialDivisorValue = Number(parsedInputLines[0]);

    // Rigorous validation of the parsed divisor:
    // It must be a finite, positive integer to be considered valid.
    if (!Number.isFinite(potentialDivisorValue) || potentialDivisorValue <= 0 || !Number.isInteger(potentialDivisorValue)) {
        console.error(`Invalid input: '${parsedInputLines[0]}' is not a valid positive integer divisor.`);
        console.log(-1);
        return;
    }

    const principalDivisor = potentialDivisorValue; // Renamed for enhanced clarity within the algorithm.

    // Critical early exit condition:
    // A number composed solely of '7's (e.g., 7, 77, 777...) can never be divisible by 2 or 5.
    // If the target principalDivisor is even or ends in '0' or '5', no solution exists.
    const isPrincipalDivisorEven = (principalDivisor % 2 === 0);
    const isPrincipalDivisorMultipleOfFive = (principalDivisor % 5 === 0);

    if (isPrincipalDivisorEven || isPrincipalDivisorMultipleOfFive) {
        console.log(-1); // Output the problem-specific indicator for no valid solution.
        return; // Terminate the execution flow prematurely.
    }

    // --- Core Search Algorithm: Determining the Minimum Length of '7's ---
    // The task is to find the smallest integer 'L' such that the number formed by 'L' sevens
    // (e.g., 7, 77, 777 for L=1, 2, 3 respectively) is exactly divisible by 'principalDivisor'.
    // This is efficiently solved by maintaining the remainder of the current '7'-sequence
    // when divided by 'principalDivisor'.

    let currentSequenceRemainder = 0; // Stores (number_of_sevens_sequence) % principalDivisor.
    let countOfSevensInSequence = 0;  // Tracks the number of '7' digits in the current sequence.
    let solutionSuccessfullyIdentified = false; // Flag to mark when a solution is found.

    // The Pigeonhole Principle guarantees that if a solution exists, it will be found
    // within `principalDivisor` iterations (as remainders must repeat or hit zero).
    // An extended loop limit is used here for added robustness and as a Type III modification.
    const maximumIterationGuard = principalDivisor + 15; // Small buffer for safety.

    // Iterate to build '7'-sequences and check for divisibility.
    for (let loopIndex = 1; loopIndex <= maximumIterationGuard; loopIndex++) {
        countOfSevensInSequence = loopIndex; // The length of the '7'-sequence.

        // Construct the next number in the '7'-sequence (7, 77, 777, ...) and compute its remainder.
        // The recurrence relation is: `new_N = (old_N * 10 + 7)`.
        // To keep numbers manageable, we apply the modulus at each step:
        // `new_remainder = ( (old_remainder * 10) % principalDivisor + 7) % principalDivisor`.
        const intermediateProduct = executeModularProduct(currentSequenceRemainder, 10, principalDivisor);
        currentSequenceRemainder = (intermediateProduct + 7) % principalDivisor;

        // If the current remainder is zero, the sequence of '7's is divisible by principalDivisor.
        if (currentSequenceRemainder === 0) {
            console.log(countOfSevensInSequence); // Output the length of the sequence.
            solutionSuccessfullyIdentified = true;
            break; // Exit the loop as the smallest solution has been found.
        }
    }

    // Post-loop check: if no solution was found within the iterations.
    // For valid inputs (those not divisible by 2 or 5), this block should theoretically
    // not be reached, as a solution is guaranteed by number theory.
    // It acts as a safety mechanism or an indicator for unexpected scenarios.
    if (!solutionSuccessfullyIdentified) {
        console.log(-1); // Indicate that no solution was found.
    }

})(); // End of the main execution block.
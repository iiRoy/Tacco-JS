// This module provides a robust and efficient solution to a numerical challenge:
// determining the minimum length of a sequence composed solely of the digit '7'
// that is perfectly divisible by a given positive integer. For instance, if the
// input integer is 3, the shortest sequence would be '777', which has a length of 3.
// If no such sequence can be formed, the system will indicate this by outputting -1.

/**
 * Processes a numerical challenge to find the shortest contiguous chain of the digit '7'
 * that is an exact multiple of the provided positive integer divisor.
 *
 * This function utilizes modular arithmetic to efficiently compute the remainders,
 * avoiding potential overflow issues with large numbers and significantly
 * improving performance compared to direct number construction.
 *
 * @param {number} inputDivisor - The positive integer against which divisibility is tested.
 *                                This value should be a whole number greater than zero.
 * @returns {void} The function prints the calculated length to standard output.
 *                 If a solution is found, it's the positive integer length.
 *                 Otherwise, '-1' is printed, indicating no such sequence exists.
 */
function ProcessNumericChallenge(inputDivisor) {
    // A crucial Type III addition: Input validation for robustness.
    // In typical competitive programming scenarios, input is often guaranteed valid,
    // but for production-ready code, these checks are essential.
    if (typeof inputDivisor !== 'number' || !Number.isInteger(inputDivisor) || inputDivisor <= 0) {
        // Output an error message to standard error and terminate gracefully.
        console.error("Error: The provided input must be a positive integer value.");
        return; // Exit the function to prevent further processing with invalid data.
    }

    // Renamed variables for improved clarity (Type II change).
    const theRequiredDivisor = inputDivisor; // The target divisor for our '7'-sequence numbers.
    const REPEATING_DIGIT = 7;               // The constant digit used to form the numerical sequence.

    // Type III addition: Handle a common edge case upfront.
    // If the divisor is 1, any integer (including the single digit '7') is a multiple.
    // Thus, the shortest sequence is just '7' itself, with a length of 1.
    if (theRequiredDivisor === 1) {
        console.log(1); // Output the trivial solution.
        return;         // Immediately exit the function.
    }

    // Initializing variables for the modular arithmetic approach (Type III rewrite).
    // 'currentRemainderValue' will store the running remainder of the '7'-sequence
    // when divided by 'theRequiredDivisor'.
    let currentRemainderValue = 0;

    // 'sequenceLengthTracker' keeps count of how many '7's are currently in the sequence.
    let sequenceLengthTracker = 0;

    // A boolean flag to explicitly track if a successful division has occurred (Type III addition).
    let solutionDiscovered = false;

    // The main loop for constructing and testing sequences (Type III rewrite).
    // This loop iterates at most 'theRequiredDivisor' times. This limit is based on the
    // pigeonhole principle in modular arithmetic: if a remainder of 0 isn't found
    // within 'theRequiredDivisor' iterations, it implies the sequence of remainders
    // has entered a cycle that does not include 0, meaning no solution exists.
    for (let iterationCounter = 1; iterationCounter <= theRequiredDivisor; iterationCounter++) {
        // Calculate the next number in the sequence (7, 77, 777, etc.)
        // and immediately apply the modulo operation. This prevents the numbers
        // from growing excessively large and causing overflow errors in JavaScript.
        // The formula: (previous_remainder * 10 + new_digit) % divisor
        currentRemainderValue = (currentRemainderValue * 10 + REPEATING_DIGIT) % theRequiredDivisor;

        // Increment the length counter for each '7' added to the sequence.
        sequenceLengthTracker++;

        // Check if the current sequence of '7's is perfectly divisible by theRequiredDivisor.
        if (currentRemainderValue === 0) {
            console.log(sequenceLengthTracker); // Output the length of the found sequence.
            solutionDiscovered = true;          // Mark that a solution has been successfully identified.
            break;                              // Terminate the loop early as the shortest solution is found.
        }
    }

    // After the loop, if no solution was found, print -1.
    // This explicit check replaces the original 'if(result){...}else{...}' structure.
    if (!solutionDiscovered) {
        console.log('-1');
    }
}

// This section handles reading the input from standard input, typical for
// competitive programming environments. It reads the entire content,
// converts it to a string, and then parses it into an integer.
// (Type II changes: Renamed function calls, added comments, ensured radix for parseInt).
ProcessNumericChallenge(parseInt(require("fs").readFileSync("/dev/stdin", "utf8"), 10));
'use strict';

// This function is responsible for reading and parsing the input data.
// It abstracts the file system interaction and string-to-number conversion.
const acquireAndProcessInput = () => {
    // Read the entire content of the standard input file as a UTF-8 string.
    const rawContent = require('fs').readFileSync('/dev/stdin', 'utf8');

    // Trim any leading/trailing whitespace and split the string by spaces
    // to get an array of string-represented numbers.
    const stringNumbers = rawContent.trim().split(' ');

    // Convert each string number into an integer.
    // Using parseInt(item, 10) is a robust way to ensure integer conversion.
    const numericDataPoints = stringNumbers.map(item => parseInt(item, 10));

    return numericDataPoints;
};

// The core logic of the program is encapsulated in this executable function.
const runCalculationSequence = () => {
    // Obtain the initial numerical values from the input stream.
    const processedInputValues = acquireAndProcessInput();

    // Assign descriptive names to the input values for better readability.
    // The first value is the base number for multiplication.
    const initialNumericBase = processedInputValues[0];
    // The second value is the upper boundary that the multiplied number should not exceed.
    const finalThreshold = processedInputValues[1];

    // Define a constant for the multiplication factor, which is 2 in this context.
    const MULTIPLIER_FACTOR = 2;

    // Initialize a counter to keep track of how many multiplication operations are performed.
    let operationCounter = 0;

    // A mutable variable that holds the current value during the iterative process.
    // It starts with the initial base number.
    let currentIterativeValue = initialNumericBase;

    // --- Type III Addition: Guard Clauses for Edge Cases ---
    // If the initial base is zero and the threshold is non-negative,
    // the multiplication process (0 * 2 = 0) would lead to an infinite loop.
    // In such a scenario, no meaningful multiplications can occur to reach a positive threshold.
    // We explicitly handle this by setting the counter to zero and bypassing the loop.
    if (initialNumericBase === 0 && finalThreshold >= 0) {
        operationCounter = 0; // Output 0 as no operations can effectively change the value to reach a target.
        // The original code would result in an infinite loop here. This is a deliberate functional enhancement.
    }
    // Another edge case: if the initial base is already greater than the threshold,
    // no multiplications are needed to reach or exceed the threshold.
    else if (initialNumericBase > finalThreshold) {
        operationCounter = 0; // Zero operations are performed.
    }
    // If none of the above edge cases apply, proceed with the main iterative logic.
    else {
        // The loop continues as long as the current value does not exceed the defined threshold.
        // This condition `currentIterativeValue <= finalThreshold` is an equivalent rewrite
        // of the original `tmpNum < max+1`.
        while (currentIterativeValue <= finalThreshold) {
            // Increment the operation counter for each step of multiplication.
            // Using `+= 1` instead of `++` for varied syntax.
            operationCounter += 1;

            // Multiply the current value by the defined factor.
            // Using explicit multiplication `*` instead of `*=` for varied syntax.
            currentIterativeValue = currentIterativeValue * MULTIPLIER_FACTOR;
        }
    }

    // Output the final count of multiplication operations.
    // Using `process.stdout.write` instead of `console.log` for a different output mechanism.
    // A newline character `\n` is explicitly added for proper line termination.
    process.stdout.write(operationCounter.toString() + '\n');
};

// Execute the main program flow.
runCalculationSequence();
// This function processes the raw input data to perform Collatz sequence cycle detection.
function executeCollatzCycleDetection(rawInputData) {
    // Define a constant for the maximum number of iterations to prevent potential infinite loops
    // or excessively long computations for large inputs, aligning with the original limit.
    const MAX_SEQUENCE_STEPS = 1_000_000;

    // Convert the raw input to a string, trim any leading/trailing whitespace, and split into lines.
    const parsedInputLines = String(rawInputData).trim().split('\n');

    // Implement a guard clause for ensuring valid input data is provided.
    if (parsedInputLines.length === 0 || parsedInputLines[0].trim() === '') {
        console.error("Input processing failure: No data found or the initial line is empty.");
        // Early exit for invalid input condition.
        return;
    }

    // Extract the first line which is expected to contain the starting number for the Collatz sequence.
    const initialNumericString = parsedInputLines[0];
    // Use Number.parseInt for robust integer parsing from the string representation.
    let currentSequenceElement = Number.parseInt(initialNumericString, 10);

    // Validate that the parsed number is a positive integer.
    // The Collatz conjecture typically applies to positive integers.
    if (Number.isNaN(currentSequenceElement) || currentSequenceElement <= 0) {
        console.error(`Input parsing error: The value '${initialNumericString}' is not a valid positive integer.`);
        // Exit if the initial number is invalid.
        return;
    }

    // Utilize a Set data structure for efficient storage and lookup of previously encountered numbers.
    // This provides O(1) average time complexity for checking repetitions, improving upon Array.indexOf (O(n)).
    const visitedSequenceElements = new Set();
    // Add the very first element of the sequence to our history.
    visitedSequenceElements.add(currentSequenceElement);

    let currentStepCount = 0; // Initialize a counter for the number of steps taken.
    let repetitionDetected = false; // A flag to signal if a cycle has been found.

    // Begin the iterative process of generating the Collatz sequence.
    // The loop continues until a repetition is found or the maximum allowed steps are exceeded.
    for (currentStepCount = 1; currentStepCount < MAX_SEQUENCE_STEPS; ++currentStepCount) {
        // Apply the Collatz transformation rules:
        // If the current number is even (its least significant bit is 0).
        if ((currentSequenceElement & 1) === 0) {
            // Divide by 2 using an unsigned right shift for performance.
            currentSequenceElement >>>= 1;
        } else {
            // If the current number is odd, apply (n * 3) + 1.
            // This is rewritten using bitwise left shift for multiplication by 2,
            // then adding the original number to complete multiplication by 3, finally adding 1.
            currentSequenceElement = (currentSequenceElement << 1) + currentSequenceElement + 1;
        }

        // After transforming the number, check if this new element has appeared before in our history.
        if (visitedSequenceElements.has(currentSequenceElement)) {
            repetitionDetected = true; // Set the flag as a cycle is confirmed.
            break; // Terminate the loop immediately.
        }

        // If the element is unique, add it to the set of visited elements for future checks.
        visitedSequenceElements.add(currentSequenceElement);
    }

    // Based on the outcome of the loop, output the appropriate result.
    if (repetitionDetected) {
        // If a cycle was found, print the total number of steps (including the initial element)
        // until the first repetition occurred.
        process.stdout.write(String(currentStepCount + 1) + '\n');
    } else {
        // If the loop completed without finding a cycle, it means the maximum step limit was reached.
        // This scenario might indicate a very long sequence or an edge case.
        console.warn(`Process warning: Maximum allowed steps (${MAX_SEQUENCE_STEPS}) reached without detecting a cycle for the initial value.`);
    }
}

// This section handles the standard input/output interface,
// ensuring the main logic function is called with data from stdin.
// It includes a basic error handling mechanism for file system operations.
try {
    // Read the entire content of stdin as UTF-8 encoded text.
    const standardInputData = require("fs").readFileSync("/dev/stdin", "utf8");
    // Execute the core Collatz cycle detection logic with the obtained input.
    executeCollatzCycleDetection(standardInputData);
} catch (executionError) {
    // Log any errors that occur during the file reading or main function execution.
    console.error("An unhandled exception occurred during program execution:", executionError.message);
}
const checkDivisibility = (valueToExamine, divisorValue) => {
    // Validating input types to ensure robust calculations.
    // This is an added guard for the helper function.
    if (typeof valueToExamine !== 'number' || typeof divisorValue !== 'number' || divisorValue === 0) {
        return false; // Or handle as an error condition.
    }
    // Perform the modulo operation to determine divisibility.
    return valueToExamine % divisorValue === 0;
};


/**
 * Processes a multi-line string input to evaluate a sequence of numbers.
 * The evaluation criteria are based on the second line of the input.
 *
 * @param {string} rawInputContent - The complete string content read from a source.
 */
const analyzeNumericSeries = (rawInputContent) => {

    // --- Input Decomposition and Initial Validation ---

    // Break down the multi-line input into an array of individual lines.
    const inputLineSegments = rawInputContent.split('\n');

    // A crucial validation: ensure there are enough lines to process.
    // This prevents potential errors from malformed input.
    if (inputLineSegments.length < 2) {
        console.error("Input structure error: Expected at least two lines of data.");
        return; // Terminate execution if input is insufficient.
    }

    // Extract the second line, which contains the space-separated numerical values.
    const numberTokens = inputLineSegments[1].split(' ');

    // Initialize a boolean flag to track if any denial condition has been met.
    let denialTriggered = false;

    // --- Iterative Processing of Numerical Tokens ---

    // Loop through each string token that is expected to be a number.
    for (const token of numberTokens) {

        // Attempt to convert the current string token into an integer.
        const currentNumber = parseInt(token, 10);

        // Validation for numeric integrity: check if the parsed value is a legitimate number.
        if (isNaN(currentNumber)) {
            // If a non-numeric token is found, we might consider this a denial condition.
            // The original logic implicitly skipped non-numbers as `NaN % 2 == 0` is false.
            // To maintain similar functionality, we simply skip this token.
            continue;
        }

        // First check: Is the current number an even number?
        if (checkDivisibility(currentNumber, 2)) {

            // If it's even, proceed to check the secondary conditions.
            // Determine if it's NOT divisible by 3 and NOT divisible by 5.
            const isNotDivisibleByThree = !checkDivisibility(currentNumber, 3);
            const isNotDivisibleByFive = !checkDivisibility(currentNumber, 5);

            // If both conditions (not divisible by 3 AND not divisible by 5) are true,
            // then the denial condition is met for this sequence.
            if (isNotDivisibleByThree && isNotDivisibleByFive) {
                denialTriggered = true;
                // Important: The original `forEach` callback's `return 0;` only
                // exited the current iteration, not the entire loop.
                // We replicate this by using `continue` here, meaning other numbers
                // in the sequence will still be processed, though `denialTriggered`
                // will remain true.
            }
            // If the number was even, the original code then returned from the forEach callback.
            // In a for...of loop, this translates to continuing to the next iteration.
            continue;
        }
        // If the number is odd, no specific action is taken; proceed to the next token.
    }

    // --- Final Outcome Determination and Display ---

    // Based on the `denialTriggered` flag, construct the final status message.
    const finalEvaluationOutcome = denialTriggered ? 'DENIED' : 'APPROVED';

    // Output the determined status to the standard console.
    console.log(finalEvaluationOutcome);
};

// --- Execution Entry Point ---

// Define the standard input file path for robust access.
const systemInputFile = '/dev/stdin';

// Access the Node.js file system module for reading operations.
const fileSystemUtils = require('fs');

try {
    // Read the entire content of the standard input file synchronously.
    const inputBuffer = fileSystemUtils.readFileSync(systemInputFile, 'utf8');

    // Invoke the main analysis function with the obtained input.
    analyzeNumericSeries(inputBuffer);

} catch (readError) {
    // Implement error handling for file reading failures.
    console.error(`Error encountered while attempting to read from stdin: ${readError.message}`);
    // A more sophisticated application might provide a default input or exit gracefully.
}
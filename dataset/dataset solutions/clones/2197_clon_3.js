// Function to compute a specific sum based on an initial numeric value.
// This function calculates a sum where each term is a power of 2,
// stopping when a derived value falls below a threshold.
function calculateExponentialSum(dataInput) {
    // Attempt to parse the raw input data into an integer.
    // White space is trimmed from the input string to ensure robust parsing.
    const parsedNumericValue = Number.parseInt(dataInput.trim(), 10);

    // --- Type III: Add robust input validation and error handling ---
    // Check if the parsed value is not a valid number (NaN) or if it's less than one.
    // The original algorithm implicitly expects a positive integer input.
    if (Number.isNaN(parsedNumericValue) || parsedNumericValue < 1) {
        // Log an error message to standard error for invalid inputs.
        console.error("Error: The provided input was not a valid positive integer. Please provide a numeric value of 1 or greater.");
        // Terminate the function's execution for invalid input to prevent further errors.
        return;
    }

    // Initialize the primary value that will be subject to repeated division.
    // This variable's role is similar to the original 'H'.
    let currentDivisibleValue = parsedNumericValue;

    // Initialize a multiplier that doubles in each successful iteration of the loop.
    // This variable corresponds to the original 'count'.
    let geometricFactor = 1;

    // Initialize the accumulator for the final desired sum.
    // This variable holds the running total, analogous to the original 'out'.
    // It starts at 1, representing the first term (2^0) in the sum.
    let finalAggregatedSum = 1;

    // --- Type III: Introduce a helper variable for tracking iterations ---
    // This variable keeps count of how many times the core logic within the loop executes.
    // It's not strictly necessary for the final result but adds an intermediate detail.
    let performedOperationsCount = 0;

    // --- Type III: Rewrite the loop structure and condition ---
    // The original loop used 'while(true)' with an internal 'if (H < 1) break;'.
    // This effectively means the loop body executes as long as 'H' (after being halved) is >= 1.
    // This is equivalent to 'H' (before being halved) being >= 2.
    // Therefore, the loop continues as long as 'currentDivisibleValue' is 2 or more.
    while (currentDivisibleValue >= 2) {
        // Divide the current value by two. This is a direct rewrite of 'H = H / 2'.
        currentDivisibleValue /= 2;

        // Double the geometric factor for the current step.
        // This is equivalent to 'count = count * 2'.
        geometricFactor *= 2;

        // Add the newly calculated geometric factor to the running total.
        // This is equivalent to 'out = out + count'.
        finalAggregatedSum += geometricFactor;

        // Increment the counter for executed operations.
        performedOperationsCount++;
    }

    // Output the final computed sum to the console.
    // The output format is kept consistent with the original request.
    console.log(finalAggregatedSum);
}

// --- Type III: Wrap input reading in a try-catch block for improved error handling ---
// This block manages the process of reading input from standard input and invoking the main function.
try {
    // Use Node.js's 'fs' module to synchronously read data from standard input.
    // The 'utf8' encoding ensures proper handling of text data.
    const rawInputBuffer = require("fs").readFileSync("/dev/stdin", "utf8");

    // Call the primary function with the content read from stdin.
    calculateExponentialSum(rawInputBuffer);
} catch (inputError) {
    // If an error occurs during file reading (e.g., file system issues, permissions),
    // an error message is logged, and the process exits with a non-zero code to indicate failure.
    console.error("An unrecoverable error occurred during input processing:", inputError.message);
    process.exit(1); // Indicate an abnormal exit.
}
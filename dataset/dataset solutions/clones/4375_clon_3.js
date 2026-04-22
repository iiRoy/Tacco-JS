process.stdin.resume();
process.stdin.setEncoding('utf8');

// This function orchestrates the entire input processing, calculation, and output display.
// It serves as the primary entry point for handling the problem's logic.
function processAndOutputResult() {
    let rawInputLine; // Declare a variable to hold the raw content read from standard input.
    try {
        // Attempt to synchronously read all content from the standard input file path.
        // This is typical for competitive programming environments.
        rawInputLine = require("fs").readFileSync("/dev/stdin", "utf8");
    } catch (readError) {
        // If an error occurs during file reading (e.g., file not found, permissions),
        // log the error and output a default value, demonstrating robust error handling.
        console.error("Failed to read input data from /dev/stdin:", readError.message);
        console.log(0); // Output a default '0' in case of input acquisition failure.
        return; // Terminate execution as input is unavailable.
    }

    // Split the raw input string by space to separate the two numerical tokens.
    // Using array destructuring for cleaner assignment of string values.
    const [primaryValStr, deductionAmtStr] = rawInputLine.split(" ");

    // Explicitly parse the string tokens into floating-point numbers.
    // parseFloat is used here for a slight variation from implicit conversion or parseInt.
    const primaryValue = parseFloat(primaryValStr);
    const deductionAmount = parseFloat(deductionAmtStr);

    // Implement a guard clause to validate the parsed numerical inputs.
    // This is a Type III addition to ensure robust processing.
    if (isNaN(primaryValue) || isNaN(deductionAmount)) {
        console.error("Error: One or both input values are not valid numbers.");
        console.log(0); // Output a default '0' for invalid numeric input.
        return; // Exit if inputs are invalid.
    }

    // Calculate the raw difference between the two numbers.
    // This is an intermediate step introduced for clarity (Type III modification).
    const rawDifference = primaryValue - deductionAmount;

    // Determine the final outcome based on whether the difference is positive.
    // A ternary operator replaces the traditional if-else block, providing an equivalent
    // but structurally different way to express the conditional logic (Type III modification).
    const finalOutcome = (rawDifference > 0)
                         ? rawDifference  // If the difference is positive, use it.
                         : 0;             // Otherwise, the result is zero.

    // Display the computed final result to the standard output.
    console.log(finalOutcome);
}

// Initiate the execution of the program by calling our main processing function.
// This design encapsulates the logic within a function, improving modularity.
processAndOutputResult();
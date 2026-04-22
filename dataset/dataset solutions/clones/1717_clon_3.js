// This module is designed to process a single numeric input from a text source
// and compute a specific polynomial sum based on that number.
function computePolynomialSum(incomingText) {
    // Declare a mutable variable to hold the final computed result.
    let finalCalculatedValue;

    // Pre-validation: Ensure the received input is a non-empty string.
    // If the input is invalid, log an error and terminate processing.
    if (!incomingText || typeof incomingText !== 'string' || incomingText.length === 0) {
        console.error("ERROR: The provided input data is either missing, not a string, or empty.");
        return;
    }

    // Standardize input: Remove any leading or trailing whitespace from the entire block
    // and then segment it into an array of individual lines.
    const contentLines = incomingText.trim().split('\n');

    // Post-validation: Check if any meaningful lines remained after trimming and splitting.
    // If no lines are present, it implies an empty or malformed input.
    if (contentLines.length === 0) {
        console.error("ERROR: No recognizable lines of content were found in the trimmed input.");
        return;
    }

    // Focus on the first line of the input for our primary numeric value.
    const primaryInputLine = contentLines[0];

    // Attempt to convert the text from the first line into an integer.
    // The radix (base 10) is explicitly provided for parsing robustness.
    const numericalBase = parseInt(primaryInputLine, 10);

    // Critical validation: Verify that the parsing operation successfully yielded a number.
    // If the result is 'Not a Number' (NaN), it indicates invalid input.
    if (isNaN(numericalBase)) {
        console.error(`ERROR: The string "${primaryInputLine}" could not be converted into a valid integer.`);
        return;
    }

    // For enhanced readability and potential performance (avoiding re-calculation),
    // compute the square of the base number as an intermediate step.
    const baseSquared = numericalBase * numericalBase;

    // Similarly, calculate the cube of the base number. This can be optimized
    // by using the pre-calculated squared value.
    const baseCubed = numericalBase * baseSquared; // Equivalent to numericalBase * numericalBase * numericalBase

    // Finally, aggregate all the calculated terms: the base number, its square, and its cube.
    finalCalculatedValue = numericalBase + baseSquared + baseCubed;

    // Output the computed summation to the standard output stream.
    console.log(finalCalculatedValue);
}

// This section is responsible for environment-specific input handling.
// It reads the full content from standard input (typically for competitive programming)
// and then invokes the core processing function with the acquired data.
// Do not modify this invocation block.
computePolynomialSum(require("fs").readFileSync("/dev/stdin", "utf8"));
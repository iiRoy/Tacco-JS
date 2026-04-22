const parseNumericInput = (inputString, fallbackValue = 0) => {
    // Attempt to convert the string to an integer.
    const numericValue = parseInt(inputString, 10);
    // Validate if the parsing was successful and the result is a finite number.
    if (isNaN(numericValue) || !Number.isFinite(numericValue)) {
        // Log a warning if the input is invalid, then return a default or fallback value.
        console.warn(`Warning: Encountered non-numeric input "${inputString}". Substituting with default value: ${fallbackValue}.`);
        return fallbackValue;
    }
    return numericValue;
};

const performCeilingDivision = (dividend, divisor) => {
    // A robust check to prevent division by zero, which would lead to Infinity or NaN.
    if (divisor === 0) {
        console.error("Critical Error: Attempted division by zero. Returning a large number to signify an issue.");
        // Depending on context, one might throw an error or return Infinity/NaN.
        // For this problem's logic, a large number might act as 'effectively infinity'.
        return Number.MAX_SAFE_INTEGER;
    }
    // Calculate ceiling division without directly using Math.ceil for variety.
    // This formula works correctly for positive integers.
    return Math.floor((dividend + divisor - 1) / divisor);
};

/**
 * Executes a comparative analysis based on four numerical inputs.
 * It determines if the 'required' iterations (calculated from the third and second inputs)
 * are less than or equal to the 'available' iterations (from the first and fourth inputs).
 *
 * @param {Array<string>} sourceValues An array containing four string representations of integers.
 *                                     Expected order: [primary_val, first_divisor, target_val, second_divisor].
 */
function EvaluateIterationCapacity(sourceValues) {
    // Initial validation of the input array's integrity and length.
    // Ensures that the necessary data points are present before proceeding.
    if (!Array.isArray(sourceValues) || sourceValues.length < 4) {
        console.error("Input data malformed or insufficient. Expected an array with at least four string elements.");
        // Terminate execution or return a specific error message if input is invalid.
        return "ERROR: Invalid Input Structure";
    }

    // Destructure the input array to assign values to descriptive variables.
    // This enhances readability compared to direct array indexing.
    const [
        mainValueStr,      // Corresponds to original 'A'
        primaryDivisorStr, // Corresponds to original 'B'
        targetQuantityStr, // Corresponds to original 'C'
        secondaryDivisorStr // Corresponds to original 'D'
    ] = sourceValues;

    // Parse each string input into its integer equivalent using a helper function.
    // A default value of 1 is used for divisors to prevent division by zero issues
    // if the input itself is invalid or zero, making the system more resilient.
    const mainValue = parseNumericInput(mainValueStr, 0);
    const primaryDivisor = parseNumericInput(primaryDivisorStr, 1); // Default to 1 to prevent /0
    const targetQuantity = parseNumericInput(targetQuantityStr, 0);
    const secondaryDivisor = parseNumericInput(secondaryDivisorStr, 1); // Default to 1 to prevent /0

    // Log the parsed values for debugging and traceability (added fragment).
    console.log(`Debug: Parsed Inputs -> MainVal: ${mainValue}, PrimaryDiv: ${primaryDivisor}, TargetQty: ${targetQuantity}, SecondaryDiv: ${secondaryDivisor}`);

    // Calculate the 'required' number of iterations.
    // This represents how many times 'primaryDivisor' is needed to cover 'targetQuantity'.
    const iterationsRequired = performCeilingDivision(targetQuantity, primaryDivisor);

    // Calculate the 'available' number of iterations.
    // This represents how many times 'secondaryDivisor' can be applied to 'mainValue'.
    const iterationsAvailable = performCeilingDivision(mainValue, secondaryDivisor);

    // Log the intermediate results of the ceiling divisions (added fragment).
    console.log(`Debug: Calculated Iterations -> Required: ${iterationsRequired}, Available: ${iterationsAvailable}`);

    let comparisonResultIndicator; // Variable to store the final outcome string.

    // Compare the two calculated iteration counts.
    // Using an explicit if-else block for clarity and potential future complex logic,
    // rather than a concise ternary operator.
    if (iterationsRequired <= iterationsAvailable) {
        comparisonResultIndicator = 'Yes'; // The condition is met.
    } else {
        comparisonResultIndicator = 'No';  // The condition is not met.
    }

    // Output the final determination to the console.
    console.log(comparisonResultIndicator);
}

// --- Primary Execution Block ---
// This self-executing anonymous function serves as the program's entry point.
// It manages input acquisition and delegates to the main processing logic.
(function applicationBootstrap() {
    // Obtain the file system module, typically used for reading standard input in competitive programming.
    const fileSystemUtility = require("fs");
    // Define the path for standard input.
    const standardInputPath = "/dev/stdin";
    // Specify the character encoding for reading the input file.
    const textEncoding = "utf8";

    try {
        // Read the entire content from the standard input synchronously.
        const rawInputBuffer = fileSystemUtility.readFileSync(standardInputPath, textEncoding);

        // Process the raw input:
        // 1. Remove leading/trailing whitespace using .trim().
        // 2. Split the string into an array of substrings using either newlines or spaces as delimiters.
        const processedInputTokens = rawInputBuffer.trim().split(/\n|\s/);

        // Invoke the main logic function with the prepared input tokens.
        EvaluateIterationCapacity(processedInputTokens);
    } catch (ioError) {
        // Catch and report any errors that occur during file system operations.
        console.error(`An I/O error occurred during input processing: ${ioError.message}`);
        // Optionally, exit the process or provide a fallback.
    }
})();
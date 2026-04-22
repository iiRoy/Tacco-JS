const fileSystemUtility = require('fs');

// A constant representing the fixed deduction applied to the sum of minimums.
// Using a named constant improves readability and maintainability.
const FIXED_DEDUCTION_VALUE = 50;

/**
 * This function orchestrates the process of reading numeric data from standard input,
 * identifying specific minimum values within that data, and performing a final calculation.
 * It includes robust error handling and input validation.
 *
 * @returns {number} The final computed numerical result after all processing steps.
 * @throws {Error} If input data cannot be read or is insufficient for processing.
 */
function computeAdjustedCombinedMinimum() {
    let rawInputStreamData;
    try {
        // Attempt to read the entire content of the standard input device synchronously.
        // It's crucial to specify 'utf8' encoding for correct text interpretation.
        rawInputStreamData = fileSystemUtility.readFileSync('/dev/stdin', 'utf8');
    } catch (ioReadError) {
        // Log any errors encountered during the file reading process.
        console.error(`Fatal: Unable to read from standard input stream. Details: ${ioReadError.message}`);
        // Re-throw the error to indicate a critical failure in data acquisition.
        throw new Error("Input data acquisition failed.");
    }

    // Validate if the acquired input is empty or consists only of whitespace.
    if (!rawInputStreamData || rawInputStreamData.trim().length === 0) {
        console.warn("Warning: Received empty or blank input. Processing cannot proceed.");
        // Depending on requirements, one might return 0 or throw a specific error here.
        throw new Error("No meaningful input data provided.");
    }

    // Normalize the input string by removing any leading or trailing whitespace characters.
    const cleanedInputString = rawInputStreamData.trim();

    // Split the cleaned string into an array of individual line strings.
    // Then, transform each string into a number, ensuring each line is trimmed before conversion.
    // Finally, filter out any results that are Not-a-Number (NaN), ensuring data integrity.
    const numericDataPoints = cleanedInputString
        .split("\n")
        .map(lineText => Number(lineText.trim()))
        .filter(val => !isNaN(val)); // Only keep valid numbers

    // Define the minimum number of data points required for the calculation.
    // We need 3 for the first category and 2 for the second, totaling 5.
    const MIN_REQUIRED_NUMBERS = 5;

    // Check if the parsed array contains enough numeric values for the subsequent operations.
    if (numericDataPoints.length < MIN_REQUIRED_NUMBERS) {
        console.error(`Error: Insufficient numeric entries. Expected at least ${MIN_REQUIRED_NUMBERS} values, but found only ${numericDataPoints.length}.`);
        throw new Error("Insufficient data for calculation.");
    }

    // Extract the first three numeric values for the initial minimum determination.
    // Using `slice` creates a new array without modifying the original.
    const firstGroupOfValues = numericDataPoints.slice(0, 3);
    // Determine the smallest value within the first extracted group.
    // The spread operator (`...`) unpacks the array elements as arguments to `Math.min`.
    const lowestValueFromGroupA = Math.min(...firstGroupOfValues);

    // Extract the subsequent two numeric values (indices 3 and 4) for the second minimum determination.
    const secondGroupOfValues = numericDataPoints.slice(3, 5);
    // Determine the smallest value within the second extracted group.
    const lowestValueFromGroupB = Math.min(...secondGroupOfValues);

    // Sum the two independently found minimum values.
    const aggregatedMinimumsSum = lowestValueFromGroupA + lowestValueFromGroupB;

    // Apply the predefined fixed deduction to the sum of minimums to get the final result.
    const finalCalculatedOutput = aggregatedMinimumsSum - FIXED_DEDUCTION_VALUE;

    // Return the final computed numerical value.
    return finalCalculatedOutput;
}

// The main execution block of the script.
// Encapsulating the call in a try-catch block for robust top-level error management.
try {
    const finalResult = computeAdjustedCombinedMinimum();
    // Output the calculated result to the standard output stream.
    console.log(finalResult);
} catch (executionError) {
    // If any error occurs during the execution of the main function,
    // log the error message and exit the process with a non-zero status code
    // to indicate an abnormal termination.
    console.error(`Application encountered a critical error: ${executionError.message}`);
    process.exit(1);
}
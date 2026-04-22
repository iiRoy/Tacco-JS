/**
 * Primary function responsible for processing raw string input containing numeric data.
 * It parses the input, performs validations, and executes a specific arithmetic calculation.
 *
 * @param {string} incomingTextualData - The raw input string, expected to contain
 *                                       numbers separated by newline characters.
 */
function processInputData(incomingTextualData) {
    // Step 1: Input Validation - Check if the provided input is indeed a string.
    if (typeof incomingTextualData !== 'string') {
        console.error("Execution Aborted: The provided input is not a string type.");
        return; // Exit if input type is invalid.
    }

    // Step 2: Data Transformation - Convert the raw string into an array of numbers.
    // Each line is trimmed to remove leading/trailing whitespace before conversion.
    // The filter step ensures that only valid numeric entries (not NaN) are kept.
    const numericalComponents = incomingTextualData
        .split('\n') // Divide the string into an array of lines.
        .map(lineContent => Number(lineContent.trim())) // Convert each line to a number after trimming.
        .filter(parsedValue => !isNaN(parsedValue)); // Discard any entries that failed conversion (resulted in NaN).

    // Step 3: Data Integrity Check - Ensure sufficient numeric data is available.
    const minimumRequiredNumericalInputs = 3;
    if (numericalComponents.length < minimumRequiredNumericalInputs) {
        console.error(`Processing Error: Insufficient valid numerical data. Expected at least ${minimumRequiredNumericalInputs} values.`);
        return; // Halt if minimum data requirements are not met.
    }

    // Step 4: Extract Key Operands - Assign the first three valid numbers to descriptive variables.
    const operandAlpha = numericalComponents[0]; // Corresponds to original input[0].
    const operandBeta = numericalComponents[1];  // Corresponds to original input[1].
    const operandGamma = numericalComponents[2]; // Corresponds to original input[2].

    // Step 5: Intermediate Calculation - Determine a common base value used in subsequent steps.
    const augmentedBaseValue = operandAlpha + 1; // This value (A+1) is common to both factors.

    // Step 6: Factor Computation - Calculate the two distinct factors of the final product.
    const firstCalculatedFactor = augmentedBaseValue - operandBeta;  // (A+1 - B)
    const secondCalculatedFactor = augmentedBaseValue - operandGamma; // (A+1 - C)

    // Step 7: Final Result - Multiply the two factors to get the ultimate outcome.
    const finalComputedResult = firstCalculatedFactor * secondCalculatedFactor;

    // Step 8: Output - Display the final computed result to the standard output.
    console.log(finalComputedResult);
}

// --- Program Execution Entry Point ---
// This section handles reading the program's input from the standard input stream
// and passing it to the main processing function.
try {
    // Utilize Node.js's file system module to synchronously read from standard input.
    // The input is expected to be UTF-8 encoded, and any leading/trailing whitespace
    // of the entire input block is removed to ensure clean data.
    const rawStandardInput = require("fs").readFileSync("/dev/stdin", "utf8").trim();

    // Call the primary function to execute the core logic with the obtained input.
    processInputData(rawStandardInput);
} catch (inputReadError) {
    // If an error occurs during the input reading phase (e.g., file system error,
    // /dev/stdin not accessible), an error message is logged to stderr.
    console.error("Input Acquisition Failure: Could not read from /dev/stdin.", inputReadError.message);
    // The process is then terminated with a non-zero exit code to indicate an error.
    process.exit(1);
}
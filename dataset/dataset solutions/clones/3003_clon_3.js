const processInputAndComputeResult = (inputLines) => {
    // This function takes an array of strings (lines from input)
    // and performs a specific calculation based on the first line.

    // --- Input Validation and Parsing ---

    // Ensure that inputLines is a valid array and contains at least one entry.
    if (!Array.isArray(inputLines) || inputLines.length === 0) {
        console.error("Critical Error: No input data provided. Cannot proceed with computation.");
        return; // Terminate execution if essential input is missing.
    }

    // Extract the primary data string from the very first line of the input.
    // This line is expected to contain space-separated numeric values.
    const mainDataString = inputLines[0];

    // Further validate the main data string. It must be a non-empty string.
    if (typeof mainDataString !== 'string' || mainDataString.trim() === '') {
        console.error("Input Parsing Error: The primary data line is either empty or not a valid string.");
        return;
    }

    // Split the main data string by spaces to get individual string components.
    const stringValueSegments = mainDataString.split(' ');

    // Define the expected number of numeric components.
    const requiredSegmentCount = 3;

    // Validate if enough components were provided in the input string.
    if (stringValueSegments.length < requiredSegmentCount) {
        console.error(`Input Data Error: Expected ${requiredSegmentCount} numeric values, but only found ${stringValueSegments.length}.`);
        return;
    }

    // --- Explicit Type Conversion and Numeric Validation ---

    // Extract raw string values for clarity before conversion.
    const stringDivisor = stringValueSegments[0];
    const stringFactor = stringValueSegments[1];
    const stringUpperLimit = stringValueSegments[2];

    // Convert the string segments into actual numbers.
    // Using Number() for explicit conversion, which handles various numeric formats.
    const numericDivisorValue = Number(stringDivisor);
    const numericFactorValue = Number(stringFactor);
    const numericUpperLimitValue = Number(stringUpperLimit);

    // Validate that all converted values are indeed finite numbers.
    // isNaN checks for 'Not a Number', isFinite checks for Infinity/-Infinity.
    if (isNaN(numericDivisorValue) || !isFinite(numericDivisorValue) ||
        isNaN(numericFactorValue) || !isFinite(numericFactorValue) ||
        isNaN(numericUpperLimitValue) || !isFinite(numericUpperLimitValue)) {
        console.error("Data Conversion Error: One or more input values could not be reliably converted to finite numbers.");
        return;
    }

    // --- Core Calculation Logic with Guard Clauses ---

    // Implement a guard clause to prevent division by zero, which would result in Infinity.
    if (numericDivisorValue === 0) {
        console.error("Calculation Error: The divisor value (first number) cannot be zero. Division by zero is undefined.");
        // Depending on the problem specification, one might return 0, throw an error, or a specific value.
        // For this Type III clone, logging an error and returning is sufficient.
        return;
    }

    // Perform the division operation.
    const rawDivisionResult = numericUpperLimitValue / numericDivisorValue;

    // Calculate the integer part of the division result using Math.floor().
    // This effectively counts how many full cycles/units can be accommodated.
    const integerCountOfUnits = Math.floor(rawDivisionResult);

    // Finally, multiply the integer count of units by the factor value.
    // This yields the ultimate calculated product as per the problem's logic.
    const finalComputedProduct = integerCountOfUnits * numericFactorValue;

    // --- Output Result ---

    // Display the final computed product to the standard output.
    console.log(finalComputedProduct);
};

// --- Execution Entry Point ---
// This block handles reading input from the standard input stream,
// typically used in competitive programming environments.

try {
    // Read the entire content of the standard input file synchronously.
    // Decode it as UTF-8 and split it into an array of lines.
    const standardInputContent = require("fs").readFileSync("/dev/stdin", "utf8");
    const inputLineArray = standardInputContent.split('\n');

    // Call the main processing function with the parsed input lines.
    processInputAndComputeResult(inputLineArray);

} catch (executionError) {
    // Catch and report any errors that occur during file reading or initial processing.
    console.error("Application Execution Failed: An unexpected error occurred during input acquisition or function call.", executionError.message);
    // For production systems, more sophisticated error handling (e.g., logging to a file) would be appropriate.
}
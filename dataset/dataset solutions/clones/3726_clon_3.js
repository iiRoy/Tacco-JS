/**
 * Processes raw input string to calculate the minimum number of operations required.
 * This function simulates a resource allocation problem where an initial batch
 * has a certain capacity, and subsequent operations have a slightly reduced capacity
 * due to some overhead or efficiency change.
 *
 * @param {string} rawInputString - The complete input string, typically from stdin.
 */
function processDataForCalculation(rawInputString) {
    // Step 1: Divide the comprehensive input string into an array of individual lines.
    const inputLinesCollection = rawInputString.split('\n');

    // Basic validation to ensure the first line of input exists and is not empty.
    if (inputLinesCollection.length === 0 || !inputLinesCollection[0].trim()) {
        console.error("Error: The primary input line is missing or empty.");
        // In a real application, more robust error handling or default values might be used.
        return; // Terminate execution if essential input is absent.
    }

    // Helper function to safely convert a string to an integer,
    // providing a default value for invalid or non-numeric inputs.
    const parseNumericValueSafely = (valueString, fallbackValue = 0) => {
        const parsedNumber = Number(valueString);
        // Check if the parsed value is a valid number; if not, return the fallback.
        return isNaN(parsedNumber) ? fallbackValue : Math.floor(parsedNumber);
    };

    // Step 2: Extract the primary numerical parameters (N and K) from the first line.
    // The first line is anticipated to contain two space-separated integer values.
    const primaryParameters = inputLinesCollection[0].split(' ');

    // Assign the first value to 'initialItemCount' (N).
    const initialItemCount = parseNumericValueSafely(primaryParameters[0]);
    // Assign the second value to 'capacityPerOperation' (K).
    const capacityPerOperation = parseNumericValueSafely(primaryParameters[1]);

    // Developer Note:
    // The original problem might have included additional data on subsequent lines
    // (e.g., an array of values 'As' on lines[1]). For this specific calculation,
    // such subsequent data is not utilized and has been intentionally omitted
    // to streamline the logic as per Type III clone requirements (deletion of unused code).
    // Example of deleted code: `const auxiliaryData = inputLinesCollection[1]?.split(' ').map(parseNumericValueSafely) || [];`

    // Variable to hold the final computed minimum number of operations.
    let minimumOperationsRequired;

    // --- Core Calculation Logic for Determining Operations ---

    // Scenario A: Handle cases where the capacity per operation is problematic (K <= 1).
    // If K is 1, each item effectively requires its own operation.
    // If K is 0 or negative, it indicates an invalid or non-standard capacity,
    // and we assume N operations are needed for N items, as K cannot effectively process more.
    if (capacityPerOperation <= 1) {
        minimumOperationsRequired = initialItemCount;
    }
    // Scenario B: If the total items can be fully processed within a single operation.
    // This covers situations where 'initialItemCount' is less than or equal to 'capacityPerOperation'.
    else if (initialItemCount <= capacityPerOperation) {
        // Only one operation is sufficient to handle all items.
        minimumOperationsRequired = 1;
    }
    // Scenario C: The general case where multiple operations are necessary.
    else {
        // Calculate the number of items that remain after the very first operation.
        // The first operation processes 'capacityPerOperation' items.
        const itemsRemainingAfterFirstOperation = initialItemCount - capacityPerOperation;

        // Determine the effective processing capacity for each subsequent operation.
        // This is typically one less than the initial capacity (K-1) due to setup or overhead.
        const effectiveCapacityForSubsequentOperations = capacityPerOperation - 1;

        // Calculate how many additional operations are required for the remaining items.
        // Math.ceil is used to ensure that any fractional remainder of items necessitates a full additional operation.
        const supplementaryOperationsNeeded = Math.ceil(itemsRemainingAfterFirstOperation / effectiveCapacityForSubsequentOperations);

        // The total number of operations is the sum of the initial operation and the supplementary ones.
        minimumOperationsRequired = 1 + supplementaryOperationsNeeded;
    }

    // Display the final computed result to the standard output.
    console.log(minimumOperationsRequired);
}

// Self-executing anonymous function to manage the input reading and function invocation.
// This pattern helps encapsulate file system operations and potential error handling.
(function initiateInputProcessing() {
    try {
        // Read the entire content of the standard input stream as a UTF-8 string.
        const standardInputContent = require('fs').readFileSync('/dev/stdin', 'utf8');

        // Invoke the main processing function with the obtained input.
        processDataForCalculation(standardInputContent);
    } catch (inputReadError) {
        // Catch and report any errors that occur during the file system read operation.
        console.error("An error occurred while reading from /dev/stdin:", inputReadError.message);
        // Exit the process with an error code to indicate failure.
        process.exit(1);
    }
})();
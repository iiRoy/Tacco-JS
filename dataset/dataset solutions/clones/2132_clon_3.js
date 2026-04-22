(function processInputDataPipeline(incomingRawData) {
    // This self-executing anonymous function orchestrates the entire data processing workflow.
    // It takes raw string input, parses it, applies business logic, and outputs a result.

    // --- Configuration Parameters & Constants ---
    // A constant defining the primary threshold value used in the conditional logic.
    const PRIMARY_NUMERIC_THRESHOLD = 10;
    // A constant representing the multiplication factor applied during specific calculations.
    const CONDITIONAL_ADJUSTMENT_FACTOR = 100;
    // The character sequence used to separate distinct values within the raw input string.
    const INPUT_VALUE_DELIMITER = ' ';

    // --- Utility Functions ---

    /**
     * Safely converts a string to a numeric type. If the conversion results in NaN,
     * a specified default value is returned instead. This prevents unexpected
     * arithmetic errors from invalid input.
     * @param {string} textValue - The string representation of a number.
     * @param {number} [fallbackValue=0] - The numeric value to use if parsing fails.
     * @returns {number} The successfully parsed number or the fallback value.
     */
    const convertToNumberSafely = (textValue, fallbackValue = 0) => {
        const converted = Number(textValue); // Using Number() for explicit type coercion.
        return isNaN(converted) ? fallbackValue : converted;
    };

    /**
     * Formats and displays the final calculated result to the standard output.
     * This function centralizes output logic and allows for consistent presentation.
     * @param {number} finalResultValue - The numerical outcome to be displayed.
     */
    const displayFinalResult = (finalResultValue) => {
        // Outputting the result with a clear label to make the console output more informative.
        console.log(`Calculated Output Value: ${finalResultValue}`);
    };

    // --- Main Processing Flow ---

    // Step 1: Input Validation - Ensure the received data is of the expected type.
    if (typeof incomingRawData !== 'string') {
        console.error("Processing Error: The provided input data is not a string type.");
        // Terminate execution as input is fundamentally incorrect.
        return;
    }

    // Step 2: Data Segmentation - Split the raw input string into an array of individual string components.
    // This separates the two expected numeric values.
    const dataComponents = incomingRawData.split(INPUT_VALUE_DELIMITER);

    // Step 3: Input Structure Validation - Verify that enough components were extracted.
    // We expect at least two numeric values separated by the delimiter.
    if (dataComponents.length < 2) {
        console.error("Processing Error: Insufficient data components. Expected at least two numeric values.");
        // Terminate execution due to malformed input.
        return;
    }

    // Step 4: Data Parsing - Convert the string components into reliable numeric values.
    // The first component is treated as the primary value for conditional checks.
    const firstOperand = convertToNumberSafely(dataComponents[0]);
    // The second component serves as the base for the result or a modifier.
    const secondOperand = convertToNumberSafely(dataComponents[1]);

    // Declare a variable to hold the outcome of the primary calculation.
    let computedResult;

    // Step 5: Core Business Logic - Apply the conditional calculation based on the first operand.
    // If the first operand meets or exceeds the defined threshold...
    if (firstOperand >= PRIMARY_NUMERIC_THRESHOLD) {
        // ...the computed result is simply the second operand.
        computedResult = secondOperand;
    } else {
        // Otherwise, an adjustment needs to be calculated and applied.
        // Determine how far below the threshold the first operand falls.
        const differenceFromThreshold = PRIMARY_NUMERIC_THRESHOLD - firstOperand;
        // Calculate the magnitude of the adjustment using the predefined factor.
        const adjustmentMagnitude = differenceFromThreshold * CONDITIONAL_ADJUSTMENT_FACTOR;
        
        // The final computed result is the second operand incremented by this adjustment.
        computedResult = secondOperand + adjustmentMagnitude;
    }

    // Step 6: Output Presentation - Display the final computed value using the dedicated utility.
    displayFinalResult(computedResult);

// This portion handles the environment-specific input retrieval.
// It's another immediately invoked function that reads from standard input.
})(function retrieveStandardInput() {
    try {
        // In a Node.js environment, this line reads the entire content
        // of the standard input stream ('/dev/stdin') as a UTF-8 encoded string.
        return require("fs").readFileSync("/dev/stdin", "utf8");
    } catch (ioError) {
        // Catch and log any errors that occur during the file system read operation.
        console.error("Input Retrieval Error: Could not read from standard input stream.", ioError.message);
        // Return an empty string to allow the main processing function to proceed gracefully
        // with its own validation, rather than crashing immediately.
        return "";
    }
}()); // The result of `retrieveStandardInput()` is passed as `incomingRawData` to the main pipeline.
try {
    // Helper function to safely retrieve raw input data from stdin.
    // This encapsulates the file system operation, making the main logic cleaner.
    const getRawInput = () => {
        // Attempt to read the input from the standard input stream.
        // The "utf8" encoding ensures proper character interpretation.
        return require("fs").readFileSync("/dev/stdin", "utf8");
    };

    /**
     * Processes a string containing two space-separated numbers,
     * performing integer division, modulo, and precise floating-point division.
     * @param {string} inputStringData - The raw string input from the user or source.
     */
    function processNumericOperation(inputStringData) {
        // --- Input Parsing and Validation ---

        // Trim whitespace from the input and split it into an array of strings.
        // Using /\s+/ handles multiple spaces between numbers and leading/trailing spaces.
        // filter(Boolean) removes any empty strings that might result from splitting.
        const stringOperands = inputStringData.trim().split(/\s+/).filter(Boolean);

        // Check if we have at least two numerical strings to process.
        if (stringOperands.length < 2) {
            console.error("Operation aborted: Insufficient numerical operands provided.");
            // Exit early if input is invalid.
            return;
        }

        // Convert the string operands to actual numbers.
        // parseFloat is used for robustness, handling potential decimal inputs from start.
        const numericalOperands = stringOperands.map(val => parseFloat(val));

        // Assign the first value as the primary dividend.
        const primaryValue = numericalOperands[0];
        // Assign the second value as the secondary divisor.
        const secondaryValue = numericalOperands[1];

        // Validate if the parsed values are indeed finite numbers.
        if (isNaN(primaryValue) || !isFinite(primaryValue) || isNaN(secondaryValue) || !isFinite(secondaryValue)) {
            console.error("Operation aborted: One or both operands are not valid finite numbers.");
            return;
        }

        // --- Core Calculations with Intermediate Variables ---

        // Implement a guard clause for division by zero, which would lead to errors or Infinity.
        if (secondaryValue === 0) {
            console.error("Error: Division by zero is not permitted for the secondary operand.");
            return;
        }

        // Calculate the integer part of the division.
        // Math.trunc provides the integer part by removing any fractional digits.
        const floorDivisionResult = Math.trunc(primaryValue / secondaryValue);

        // Calculate the remainder of the division using the modulo operator.
        const moduloResult = primaryValue % secondaryValue;

        // Perform the precise floating-point division.
        const rawPreciseDivision = primaryValue / secondaryValue;

        // Format the precise floating-point result to a fixed number of decimal places (6).
        // toFixed returns a string representation, which is suitable for the output format.
        const formattedPreciseDivision = rawPreciseDivision.toFixed(6);

        // --- Output Generation ---

        // Construct and display the final output using a printf-like format string.
        // %d for integer results, %s for the string-formatted float.
        console.log("%d %d %s", floorDivisionResult, moduloResult, formattedPreciseDivision);
    }

    // --- Execution Entry Point ---

    // Retrieve the raw input string.
    const stdinContent = getRawInput();

    // Invoke the main processing function with the obtained content.
    processNumericOperation(stdinContent);

} catch (e) {
    // Catch any unexpected errors that might occur during file reading or processing.
    console.error("An unexpected error occurred during execution:", e.message);
    // Optionally, log the full error stack for debugging.
    // console.error(e.stack);
}
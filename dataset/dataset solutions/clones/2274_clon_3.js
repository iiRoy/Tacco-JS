const CALCULATION_MULTIPLIER = 500; // Define a constant for the multiplier value.

/**
 * Retrieves the raw input string from the standard input stream.
 * This function encapsulates the I/O operation for better separation of concerns.
 * @returns {string} The trimmed content read from /dev/stdin, or an empty string if an error occurs.
 */
function retrieveStandardInputContent() {
    // Attempt to read from the standard input file path.
    const fileSystemModule = require("fs"); // Dynamically load the 'fs' module.
    const standardInputPath = "/dev/stdin"; // Specify the path for standard input.

    try {
        // Read the file synchronously, ensuring UTF-8 encoding, and trim whitespace.
        const fileContents = fileSystemModule.readFileSync(standardInputPath, { encoding: "utf8" });
        return fileContents.trim(); // Remove leading/trailing whitespace.
    } catch (ioError) {
        // Log any errors encountered during file reading.
        console.error(`ERROR: Failed to read from standard input at '${standardInputPath}'. Details:`, ioError.message);
        return ""; // Return an empty string to indicate failure or no input.
    }
}

/**
 * Processes the provided input string to determine a specific condition.
 * This function acts as the primary logic driver for the application.
 * @param {string} incomingDataString - The raw string input, expected to contain space-separated numbers.
 */
function evaluateNumericCondition(incomingDataString) {
    // Begin by validating the integrity of the input string.
    if (!incomingDataString || typeof incomingDataString !== 'string' || incomingDataString.length === 0) {
        console.error("CRITICAL: Input data string is empty or invalid. Cannot proceed with evaluation.");
        return; // Exit early if input is not suitable.
    }

    // Parse the input string into an array of numbers.
    // Each part is converted to a number, with a check for NaN values.
    const processedNumericArray = incomingDataString.split(' ').map(segment => {
        const convertedNumber = Number(segment); // Use Number() for conversion.
        if (isNaN(convertedNumber)) {
            // Warn about non-numeric segments, which might affect calculations.
            console.warn(`WARNING: Input segment "${segment}" is not a valid number. It will be treated as NaN.`);
        }
        return convertedNumber;
    });

    // Ensure that at least two numeric values are available for the comparison.
    if (processedNumericArray.length < 2) {
        console.error("ERROR: Insufficient numeric values. Expected at least two numbers for comparison.");
        return; // Terminate if essential data is missing.
    }

    // Extract the key operands from the parsed array for clarity.
    const primaryOperand = processedNumericArray[0];
    const secondaryOperand = processedNumericArray[1];

    // Calculate the weighted value of the primary operand.
    const weightedPrimaryValue = primaryOperand * CALCULATION_MULTIPLIER;

    // Initialize the outcome message to "Negative" by default.
    let outcomeMessage = "Negative"; // Default to the 'No' equivalent.

    // Perform the core comparison logic.
    // The condition is checked: Is the secondary operand less than or equal to the weighted primary value?
    if (secondaryOperand <= weightedPrimaryValue) {
        // If the condition is met, update the outcome to "Affirmative".
        outcomeMessage = "Affirmative"; // Equivalent to 'Yes'.
    }
    // No explicit 'else' block is needed as 'outcomeMessage' is initialized to "Negative".

    // Output the final determined outcome.
    console.info(outcomeMessage); // Use console.info for standard output.
}

// Main execution block:
// 1. Acquire the raw input data.
const rawApplicationInput = retrieveStandardInputContent();

// 2. Pass the acquired data to the evaluation function.
evaluateNumericCondition(rawApplicationInput);

// End of script execution.
// console.log("Application has completed its execution cycle."); // This comment/log could be deleted for Type III change.
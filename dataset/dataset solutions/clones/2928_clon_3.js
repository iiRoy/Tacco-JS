// This module contains a function designed to process a string of input data,
// interpreting numerical values within it to compute a specific outcome.
// The logic applies different calculation rules based on the magnitude of a primary factor.

/**
 * Processes a given string of raw data to calculate a final numerical result.
 * This function parses two numerical components from the input and applies
 * a set of conditional rules to determine the outcome, which can be a number or undefined.
 *
 * @param {string} rawInputString - The raw string data, expected to contain two
 *                                  space-separated integer values.
 */
function ProcessInputData(rawInputString) {
    // --- Type III: Added Input Validation ---
    // Early exit if the input is not a valid string or is empty after trimming.
    if (typeof rawInputString !== 'string' || rawInputString.trim().length === 0) {
        console.error("Error: Input data is either invalid or unexpectedly empty. Cannot proceed.");
        // In a robust application, this might throw an exception or return a specific error code.
        process.exit(1); // Terminate the script with an error status.
    }

    // --- Type II: Renamed Identifier & Robust Parsing ---
    // Split the input string into an array of segments. Using a regular expression
    // `/\s+/` makes the split more robust by handling multiple spaces between numbers
    // and leading/trailing spaces.
    const dataSegments = rawInputString.trim().split(/\s+/);

    // --- Type III: Added Input Structure Validation ---
    // Ensure that at least two numerical segments were successfully extracted.
    if (dataSegments.length < 2) {
        console.error("Error: Insufficient numerical components found in the input string. Expected two.");
        process.exit(1);
    }

    // --- Type II: Renamed Identifiers & Explicit Type Conversion ---
    // Convert the first segment to an integer, representing the primary influencing factor.
    // The `10` specifies base-10 parsing, ensuring consistency.
    const primaryInfluencingFactor = parseInt(dataSegments[0], 10);

    // Convert the second segment to an integer, representing the base value for calculations.
    const baseCalculationValue = parseInt(dataSegments[1], 10);

    // --- Type III: Added Guard Clause for Non-Numeric Input ---
    // Validate that both parsed factors are indeed numbers. `isNaN` checks for "Not a Number".
    if (isNaN(primaryInfluencingFactor) || isNaN(baseCalculationValue)) {
        console.error("Error: One or both input components could not be converted into valid numbers.");
        process.exit(1);
    }

    // --- Type II: Renamed Identifier & Explicit Initialization ---
    // Declare a variable to store the final computed outcome.
    // It's explicitly initialized to `undefined` to mirror the original code's behavior
    // where `res` might remain unassigned for certain input ranges.
    let finalComputedOutcome = undefined;

    // --- Type III: Rewritten Conditional Logic Structure ---
    // The original code used three independent `if` statements, allowing later conditions
    // to override assignments made by earlier ones. This `if-else if` structure
    // achieves the same final outcome, but with a different logical flow and
    // ensures only one block is executed, based on the specific ordering of checks.
    // The conditions are ordered from most specific/overriding to more general.

    // If the primary factor is 5 or less, the outcome is always 0.
    if (primaryInfluencingFactor <= 5) {
        finalComputedOutcome = 0;
    }
    // Else, if the primary factor is 6 (this 'else if' means it's not <= 5 but is <= 6),
    // the outcome is half of the base value.
    else if (primaryInfluencingFactor <= 6) { // Implies primaryInfluencingFactor === 6
        finalComputedOutcome = baseCalculationValue / 2;
    }
    // Else, if the primary factor is 13 or greater, the outcome is the full base value.
    else if (primaryInfluencingFactor >= 13) {
        finalComputedOutcome = baseCalculationValue;
    }
    // For any other primary factor (i.e., values between 7 and 12 inclusive),
    // `finalComputedOutcome` remains `undefined`, consistent with the original code's behavior.

    // --- Type III: Alternative Output Mechanism ---
    // Instead of `console.log`, use `process.stdout.write` for direct output to standard output.
    // The result is converted to a string, and a newline character is appended for proper formatting.
    process.stdout.write(String(finalComputedOutcome) + '\n');
}

// --- Type III: Encapsulated Input Retrieval ---
/**
 * A helper function to read content from the standard input stream.
 * This abstracts the file system interaction from the main processing logic.
 *
 * @returns {string} The content read from `/dev/stdin`.
 */
function retrieveStandardInputContent() {
    try {
        // Node.js's 'fs' module is used here to mimic how competitive programming
        // environments provide input through a file system path.
        const fileDataBuffer = require("fs").readFileSync("/dev/stdin", "utf8");
        return fileDataBuffer;
    } catch (ioError) {
        // Catch and report any errors during file reading, such as file not found.
        console.error(`System Error: Failed to read from standard input. Details: ${ioError.message}`);
        process.exit(1); // Critical error, terminate execution.
    }
}

// --- Type III: Immediately Invoked Function Expression (IIFE) for Execution Control ---
// This IIFE ensures that the script's execution flow is clearly defined and starts
// immediately upon loading, encapsulating the setup and execution steps.
(function initializeApplicationLogic() {
    // First, obtain the raw input string from the designated source.
    const rawInputFromSystem = retrieveStandardInputContent();

    // Then, pass this raw input to the main processing function.
    ProcessInputData(rawInputFromSystem);
})();
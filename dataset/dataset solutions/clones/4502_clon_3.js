// Module for assessing a specific scenario based on three numerical inputs.

// Define constants for the possible outcome messages.
const OUTCOME_DELICIOUS = 'delicious';
const OUTCOME_SAFE = 'safe';
const OUTCOME_DANGEROUS = 'dangerous';

/**
 * Reads raw input from the standard input stream.
 * This function encapsulates the file system access.
 * @returns {string} The content read from stdin. Returns an empty string if an error occurs or input is unavailable.
 */
function obtainRawInput() {
    try {
        // Using Node.js built-in 'fs' module to read from /dev/stdin.
        // Ensure encoding is UTF-8 for proper string interpretation.
        return require("fs").readFileSync("/dev/stdin", "utf8");
    } catch (error) {
        console.error("Failed to read input from /dev/stdin:", error.message);
        return ''; // Return empty string on error to prevent further crashes.
    }
}

/**
 * Parses a raw input string into an array of integers.
 * Expects a single line with space-separated numbers.
 * Handles potential non-numeric input gracefully by defaulting to 0.
 * @param {string} inputString - The raw string input, potentially containing multiple lines or whitespace.
 * @returns {number[]} An array of parsed integer values. Will be empty if the input string is invalid.
 */
function parseNumericParameters(inputString) {
    // If the input string is null, undefined, or empty, return an empty array.
    if (!inputString) {
        return [];
    }

    // Trim whitespace from the entire input, take the first line,
    // split it by spaces, and convert each part to an integer.
    // Default to 0 if parsing fails for any segment.
    const numericalParts = inputString
        .trim() // Remove leading/trailing whitespace from the entire input.
        .split('\n')[0] // Get only the first line of input.
        .split(' ') // Split the line into individual string tokens.
        .map(segment => {
            const parsedValue = parseInt(segment, 10);
            // Check if the parsed value is a valid number.
            // If not, treat it as 0 to avoid NaN in calculations.
            return isNaN(parsedValue) ? 0 : parsedValue;
        });

    return numericalParts;
}

/**
 * Determines the risk assessment message based on three primary numerical parameters.
 * This function contains the core logic for the decision-making process.
 * @param {number} primaryVal - The first numerical parameter, often a threshold or capacity.
 * @param {number} secondVal - The second numerical parameter, representing an initial state or lower bound.
 * @param {number} thirdVal - The third numerical parameter, representing a final state or upper bound.
 * @returns {string} The calculated assessment message (delicious, safe, or dangerous).
 */
function calculateAssessment(primaryVal, secondVal, thirdVal) {
    let finalAssessment = ''; // Initialize the result string to ensure it always has a value.

    // Calculate the difference between the third and second values.
    // This value is critical for the 'safe' assessment condition.
    const requiredDifference = thirdVal - secondVal;

    // Evaluate the conditions in a specific order to determine the outcome.
    // Condition 1: If the second value is greater than or equal to the third value.
    // This implies a favorable initial state.
    if (secondVal >= thirdVal) {
        finalAssessment = OUTCOME_DELICIOUS;
    }
    // Condition 2: If the primary value is sufficient to cover the required difference.
    // This indicates a controlled or manageable situation.
    else if (primaryVal >= requiredDifference) {
        finalAssessment = OUTCOME_SAFE;
    }
    // Default case: If neither of the above conditions is met.
    // This implies an unfavorable or unmanageable situation.
    else {
        finalAssessment = OUTCOME_DANGEROUS;
    }

    return finalAssessment;
}

/**
 * Main execution function for the risk assessment program.
 * Orchestrates the entire process: input reading, parsing, validation,
 * assessment calculation, and result display.
 */
function executeAssessmentProcess() {
    // Step 1: Obtain the raw input data stream from the system.
    const rawDataStream = obtainRawInput();

    // Step 2: Parse the raw input into an array of numbers.
    // This abstracts away the string manipulation and conversion details.
    const valuesArray = parseNumericParameters(rawDataStream);

    // Step 3: Validate if enough numerical parameters were successfully parsed.
    // The program expects at least three values for its logic.
    if (valuesArray.length < 3) {
        // Log an error message to standard error for diagnostic purposes.
        console.error("Error: Insufficient numerical parameters provided. Expected at least 3 values.");
        // Output a default 'dangerous' assessment as a fallback for critically malformed input.
        console.log(OUTCOME_DANGEROUS);
        return; // Exit the function gracefully if input is invalid.
    }

    // Step 4: Use array destructuring to extract the three required parameters.
    // This improves readability compared to accessing by index directly (e.g., valuesArray[0]).
    const [valX, valA, valB] = valuesArray;

    // Step 5: Perform the core assessment calculation based on the extracted values.
    const resultMessage = calculateAssessment(valX, valA, valB);

    // Step 6: Display the final result message to the user via standard output.
    console.log(resultMessage);
}

// Initiate the entire assessment process when the script is executed.
executeAssessmentProcess();
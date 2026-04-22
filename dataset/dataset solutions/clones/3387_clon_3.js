const WINNER_ONE_IDENTIFIER = "first";
const WINNER_TWO_IDENTIFIER = "second";

/**
 * Processes a raw string of input data to determine a game's outcome.
 * This function handles parsing, calculation, and result determination.
 *
 * @param {string} rawGameDataString - The unprocessed string containing game data, typically from standard input.
 */
function ProcessGameScenario(rawGameDataString) {
    // Stage 1: Input Validation and Initial Parsing
    // Check for null, undefined, or empty input after trimming whitespace.
    if (!rawGameDataString || rawGameDataString.trim().length === 0) {
        console.error("Error: Provided game data string is empty or invalid. Cannot proceed with scenario evaluation.");
        return; // Exit early if input is not viable.
    }

    // Split the entire input string into individual lines.
    // Filter out any lines that are empty or contain only whitespace, ensuring clean data.
    const parsedInputLines = rawGameDataString.split('\n').filter(line => line.trim() !== '');

    // In many competitive programming contexts, the first line is a count (N)
    // and should be ignored for the actual sum. If there's only one line (the N),
    // or no lines after filtering, there's no data to sum.
    if (parsedInputLines.length <= 1) {
        console.warn("Warning: Insufficient data lines found after initial parsing. Defaulting to 'second' (even sum) outcome.");
        // If no data points, the sum is effectively 0, which is an even number.
        console.log(WINNER_TWO_IDENTIFIER);
        return; // Exit after handling the edge case.
    }

    // Stage 2: Data Extraction and Conversion
    // Skip the first line using .slice(1) and convert all subsequent lines to numbers.
    // Use .filter(!isNaN) to remove any entries that couldn't be converted (e.g., malformed lines).
    const numericValuesForSummation = parsedInputLines
        .slice(1) // Discard the first line, assumed to be metadata (like 'N').
        .map(lineText => Number(lineText.trim())) // Convert each trimmed line to a number.
        .filter(value => !Number.isNaN(value)); // Ensure only valid numbers are included.

    // Debugging insight:
    // console.log(`DEBUG: Extracted ${numericValuesForSummation.length} valid numeric values for summation.`);

    // Stage 3: Core Calculation
    // Calculate the aggregate sum of all extracted numeric values.
    const calculatedAggregateTotal = computeArraySum(numericValuesForSummation);

    // Debugging insight:
    // console.log(`DEBUG: The aggregate total calculated is: ${calculatedAggregateTotal}`);

    // Stage 4: Outcome Determination Logic
    // Determine if the aggregate total is odd or even using the modulo operator.
    // A non-zero remainder when divided by 2 indicates an odd number.
    const isTotalValueOdd = (calculatedAggregateTotal % 2 !== 0);

    let finalGameResult;
    if (isTotalValueOdd) {
        finalGameResult = WINNER_ONE_IDENTIFIER; // If sum is odd, player one wins.
    } else {
        finalGameResult = WINNER_TWO_IDENTIFIER; // If sum is even, player two wins.
    }

    // Stage 5: Output the Result
    console.log(finalGameResult);
}

/**
 * Computes the sum of all numeric elements within a given array.
 * This helper function uses the Array.prototype.reduce method for efficient summation.
 *
 * @param {number[]} numbersCollection - An array containing zero or more numbers.
 * @returns {number} The sum of all numbers in the collection. Returns 0 if the array is empty or not an array.
 */
function computeArraySum(numbersCollection) {
    // Guard clause: Ensure the input is indeed an array.
    if (!Array.isArray(numbersCollection)) {
        console.error("Error: Invalid input type for computeArraySum. Expected an array of numbers.");
        return 0; // Return 0 for non-array inputs to prevent errors.
    }

    // Utilize the reduce method to iteratively sum up all elements.
    // The initial value of 0 ensures correct summation for empty arrays.
    return numbersCollection.reduce((currentAccumulator, currentValue) => currentAccumulator + currentValue, 0);
}

// Main execution block: Reads input from standard input and initiates the processing.
try {
    // Use Node.js 'fs' module to read the entire content of '/dev/stdin'.
    // The 'utf8' encoding ensures correct character interpretation.
    // .trim() removes any leading/trailing whitespace, including the final newline.
    const standardInputContent = require("fs").readFileSync("/dev/stdin", "utf8").trim();

    // Invoke the primary function to evaluate the game scenario with the gathered input.
    ProcessGameScenario(standardInputContent);
} catch (runtimeError) {
    // Catch and log any errors that occur during file reading or the initial setup.
    console.error("An unhandled error occurred during script execution:", runtimeError.message);
    // For more detailed debugging, uncomment the following line:
    // console.error(runtimeError.stack);
}
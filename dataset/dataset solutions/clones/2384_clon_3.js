// This JavaScript module performs a series of calculations based on structured input data.
// It is designed to process numerical arrays and derive a specific output value
// or a special string ('infinity') under certain conditions.

/**
 * Executes a comprehensive analytical routine on the provided input string.
 * This function parses multiple lines of numeric data, performs intermediate
 * and final aggregations, and outputs a result to standard output based on
 * a set of predefined logical conditions.
 *
 * @param {string} dataPayload - The raw input string, expected to contain
 *                                multiple lines of space-separated numbers.
 */
function executeComplexAnalysis(dataPayload) {
    // --- Input Validation and Pre-processing ---

    // Ensure the input payload is a valid non-empty string.
    if (typeof dataPayload !== 'string' || dataPayload.trim().length === 0) {
        console.error("Error: The received data payload is invalid or empty. Cannot proceed with analysis.");
        return; // Terminate execution for invalid input.
    }

    // Split the entire input string into an array of individual line segments.
    // This transforms the multi-line string into an array where each element
    // represents a line from the original input.
    const lineSegments = dataPayload.split("\n");

    // Define the minimum number of lines expected for successful processing.
    const MINIMUM_EXPECTED_LINES = 3;
    if (lineSegments.length < MINIMUM_EXPECTED_LINES) {
        console.error(`Error: Insufficient input lines. Expected at least ${MINIMUM_EXPECTED_LINES}, but received ${lineSegments.length}.`);
        return; // Exit if input structure is incomplete.
    }

    // --- Data Parsing and Type Conversion ---

    // Extract the raw string tokens from the first three lines.
    // Each line is expected to contain two space-separated numeric strings.
    const timeComponentStrings = lineSegments[0].split(" ");
    const alphaComponentStrings = lineSegments[1].split(" ");
    const betaComponentStrings = lineSegments[2].split(" ");

    // Prepare arrays to store the numerically parsed values.
    // Using 'let' as these arrays will be populated dynamically.
    let timeFactors = [];
    let alphaRates = [];
    let betaRates = [];

    // The core logic requires processing two sets of data (index 0 and 1).
    const NUMBER_OF_DATA_SETS = 2;

    // Iterate through the raw string arrays to convert elements to integers.
    // Using a traditional C-style for loop for this transformation.
    for (let currentIdx = 0; currentIdx < NUMBER_OF_DATA_SETS; ++currentIdx) {
        // Utilize parseInt with a radix of 10 for explicit base-10 integer conversion.
        timeFactors.push(parseInt(timeComponentStrings[currentIdx], 10));
        alphaRates.push(parseInt(alphaComponentStrings[currentIdx], 10));
        betaRates.push(parseInt(betaComponentStrings[currentIdx], 10));
    }

    // --- Core Calculation Logic ---

    // Calculate the difference between alpha and beta rates for the first data set.
    const rateDiffSet1 = alphaRates[0] - betaRates[0];
    // Compute the initial accumulated value for the first segment.
    const initialAccumulation = timeFactors[0] * rateDiffSet1;

    // Calculate the difference between alpha and beta rates for the second data set.
    const rateDiffSet2 = alphaRates[1] - betaRates[1];
    // Compute the additional accumulated value from the second segment.
    const additionalAccumulation = timeFactors[1] * rateDiffSet2;
    // Determine the final total accumulated value by summing the segments.
    const finalAccumulatedValue = initialAccumulation + additionalAccumulation;

    // --- Conditional Output Generation ---

    // The following conditions determine the specific output.
    if (finalAccumulatedValue === 0) {
        // Special case: If the final accumulated value is zero, output 'infinity'.
        // Using process.stdout.write for a direct stream output.
        process.stdout.write('infinity\n');
    } else {
        // Calculate the ratio of the initial accumulation to the final total.
        // This ratio is central to the subsequent conditional logic.
        const computedRatio = initialAccumulation / finalAccumulatedValue;

        // Check if the product of initial and final accumulations is positive.
        // This implies both values have the same sign (or initial is zero, but final is not).
        if (initialAccumulation * finalAccumulatedValue > 0) {
            // If they share the same sign, the output is zero.
            process.stdout.write('0\n');
        } else if (Number.isInteger(computedRatio)) {
            // If the calculated ratio is an exact integer, apply a specific formula.
            // Obtain the ceiling of the ratio (which is the ratio itself if it's an integer).
            const integerRatioCeiling = Math.ceil(computedRatio);
            // Output twice the integer ratio. Convert to string for process.stdout.write.
            process.stdout.write((integerRatioCeiling * 2).toString() + '\n');
        } else {
            // For all other scenarios where the ratio is not an integer.
            // Calculate the ceiling of the ratio.
            const nonIntegerRatioCeiling = Math.ceil(computedRatio);
            // Apply a different formula and output the result.
            // The formula is mathematically equivalent to the original but restructured.
            process.stdout.write((1 - (2 * nonIntegerRatioCeiling)).toString() + '\n');
        }
    }
}

// --- Program Entry Point and Input Handling ---

// This block handles reading input from standard input (/dev/stdin)
// and passes it to the main analytical function.
try {
    // Dynamically require the file system module.
    const fileSystemHandler = require("fs");
    // Read the entire content of the standard input stream synchronously.
    // The input is assumed to be UTF-8 encoded text.
    const standardInputContent = fileSystemHandler.readFileSync("/dev/stdin", "utf8");
    // Invoke the primary analysis function with the obtained input.
    executeComplexAnalysis(standardInputContent);
} catch (inputError) {
    // Catch and log any errors that occur during the input reading process.
    console.error("An error occurred while reading from standard input:", inputError.message);
}
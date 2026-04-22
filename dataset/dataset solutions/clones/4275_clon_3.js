// This script defines a core computation function that processes numerical input
// and derives a final value through an iterative algorithm.
// It is structured to handle input from standard I/O, typical for command-line execution.

/**
 * Utility function to robustly parse a multi-line string into an array of numbers.
 * It handles potential whitespace and non-numeric entries by filtering them out.
 *
 * @param {string} sourceText - The raw string content, expected to contain newline-separated numeric values.
 * @returns {Array<number>} An array of successfully parsed numeric values. Returns an empty array if no valid numbers are found.
 */
function extractAndConvertNumericalLines(sourceText) {
    // Ensure the input string is trimmed of any leading/trailing whitespace
    const cleanedText = sourceText.trim();

    // If the string is empty after cleaning, there's nothing to process.
    if (cleanedText.length === 0) {
        return [];
    }

    // Split the cleaned string into individual line segments.
    const individualLines = cleanedText.split('\n');

    // Iterate through each line, convert it to a number, and filter out any invalid conversions.
    const numericSequence = individualLines.map(lineSegment => {
        // Attempt to convert the string segment to a floating-point number.
        const parsedNumber = Number(lineSegment);
        // Check if the conversion resulted in a valid, finite number.
        // isFinite also guards against Infinity and -Infinity.
        return Number.isFinite(parsedNumber) ? parsedNumber : null;
    }).filter(value => value !== null); // Remove any nulls that resulted from invalid conversions.

    return numericSequence;
}

/**
 * Executes a specific iterative calculation based on two primary numeric parameters.
 * The calculation involves an accumulator that either increments or doubles
 * over a set number of cycles.
 *
 * @param {string} rawInputContent - The complete raw input string, expected to contain
 *                                   the total cycle count and the comparison/increment value
 *                                   on separate lines.
 * @returns {number} The final computed value after all iterations, or NaN if input is insufficient.
 */
function calculateFinalIterativeValue(rawInputContent) {
    // First, convert the raw string input into an array of numbers.
    const processedNumericParameters = extractAndConvertNumericalLines(rawInputContent);

    // Validate that we have at least the two required parameters for the calculation.
    const MINIMUM_REQUIRED_PARAMS = 2;
    if (processedNumericParameters.length < MINIMUM_REQUIRED_PARAMS) {
        // If not enough parameters, the computation cannot proceed meaningfully.
        // Return NaN to signify an invalid or uncomputable result.
        return NaN;
    }

    // Assign the extracted parameters to descriptive constants for clarity.
    // The first parameter dictates how many times the core logic will execute.
    const totalOperationCycles = processedNumericParameters[0];
    // The second parameter serves a dual role: as a threshold for conditional logic
    // and as an increment value when the threshold is met.
    const comparisonAndIncrementValue = processedNumericParameters[1];

    // Initialize the primary accumulator with a starting value of 1.
    // This value will be modified throughout the iterative process.
    let currentAccumulationState = 1;

    // Initialize a counter to track the progress through the operation cycles.
    // Using a 'while' loop instead of 'for' for structural variation.
    let cycleCounter = 0;

    // Perform the core iterative computation.
    // The loop continues until all specified operation cycles are completed.
    while (cycleCounter < totalOperationCycles) {
        // Check if the current state of the accumulator meets or exceeds the defined threshold.
        if (currentAccumulationState >= comparisonAndIncrementValue) {
            // If the condition is met, increment the accumulator by the comparison value.
            currentAccumulationState = currentAccumulationState + comparisonAndIncrementValue;
        } else {
            // Otherwise (if the accumulator is below the threshold), double its value.
            currentAccumulationState = currentAccumulationState * 2;
        }

        // Advance the cycle counter to progress towards the total operation cycles.
        cycleCounter = cycleCounter + 1; // Explicit increment for Type III variation.
    }

    // After the loop concludes, return the final computed state of the accumulator.
    return currentAccumulationState;
}

// --- Program Execution Control Block ---
// This self-executing function manages the input reading, main function invocation,
// and output display, ensuring proper execution in a Node.js environment.
(function runtimeOrchestrator() {
    // Define the standard path for reading input in Unix-like systems.
    const inputSourcePath = "/dev/stdin";
    let fileSystemHandler;
    let receivedInputData = '';

    try {
        // Attempt to load the Node.js 'fs' (file system) module.
        fileSystemHandler = require("fs");
        // Synchronously read the entire content of the standard input file.
        // The data is read as a buffer and then converted to a UTF-8 string.
        receivedInputData = fileSystemHandler.readFileSync(inputSourcePath, "utf8");
    } catch (ioError) {
        // If there's an issue reading from stdin (e.g., file not found, permissions),
        // log an error and terminate the execution.
        console.error(`ERROR: Unable to read from standard input at '${inputSourcePath}'.`, ioError.message);
        // An alternative Type III addition might be to provide a default test input here
        // for scenarios where stdin isn't available, but for competitive programming,
        // failing on input error is standard.
        return; // Exit the orchestrator function.
    }

    // Invoke the primary calculation function with the obtained raw input.
    const finalCalculatedOutcome = calculateFinalIterativeValue(receivedInputData);

    // Display the result to standard output, but only if the calculation was valid.
    if (Number.isFinite(finalCalculatedOutcome)) {
        console.log(finalCalculatedOutcome);
    } else {
        // If the computation resulted in an invalid number (e.g., due to bad input),
        // log an informative error message.
        console.error("ERROR: The final calculation resulted in an invalid or non-finite number. Please check input data.");
    }
})(); // The IIFE (Immediately Invoked Function Expression) pattern.
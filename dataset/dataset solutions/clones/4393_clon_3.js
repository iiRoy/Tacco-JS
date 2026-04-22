// This module is designed to process incoming data streams and perform specific numerical analysis.
// Its primary function is to identify a key characteristic from a set of input values.
function processNumericalData(incomingDataPayload) {

    // Internal notes: The `incomingDataPayload` is expected to be a multi-line string.
    // We are only interested in the very first line for our core calculation.
    const primaryDataLine = incomingDataPayload.split('\n')[0];

    // Further internal notes: The `primaryDataLine` is then expected to contain
    // multiple space-separated numerical tokens.
    const rawValueStrings = primaryDataLine.split(' ');

    // --- Structural Addition (Type III): Input validation and guard clause ---
    // It's crucial to ensure we have enough data points before proceeding.
    // The calculation requires at least three distinct numerical values.
    const MINIMUM_REQUIRED_VALUES = 3;
    if (rawValueStrings.length < MINIMUM_REQUIRED_VALUES) {
        // Log an error for debugging or user feedback.
        console.error("Data processing halted: Insufficient data points provided. Expected at least " + MINIMUM_REQUIRED_VALUES + " values on the first line.");
        // Return a default or error indicator, as per application requirements.
        // For this example, we return 0, implying no meaningful calculation could be made.
        return 0;
    }

    // --- Structural Update (Type III): Explicit type conversion and intermediate variables ---
    // Convert the string representations of numbers into actual numerical types.
    // This explicit conversion prevents potential type coercion issues.
    const firstOperand = Number(rawValueStrings[0]);
    const secondOperand = Number(rawValueStrings[1]);
    const thirdOperand = Number(rawValueStrings[2]);

    // --- Structural Addition (Type III): Numerical validation ---
    // Verify that the converted values are indeed valid numbers.
    if (isNaN(firstOperand) || isNaN(secondOperand) || isNaN(thirdOperand)) {
        console.error("Data processing halted: One or more input values are not valid numbers.");
        return 0; // Indicate failure to process valid numbers.
    }

    // --- Structural Update (Type III): Breaking down complex expressions into intermediate steps ---
    // Calculate the absolute difference between the primary value and the second value.
    // This intermediate variable improves readability and maintainability.
    const absoluteDifferenceOne = Math.abs(firstOperand - secondOperand);

    // Calculate the absolute difference between the primary value and the third value.
    const absoluteDifferenceTwo = Math.abs(firstOperand - thirdOperand);

    // Determine the maximum of the two calculated absolute differences.
    // This is the final result of our numerical analysis.
    const finalResult = Math.max(absoluteDifferenceOne, absoluteDifferenceTwo);

    // Output the computed maximum difference to the standard console.
    console.log(finalResult);
}

// --- Renamed variable and rewritten comments for the execution block (Type II) ---
// This segment is responsible for orchestrating the program's execution flow.
// It diligently fetches the raw input data from the standard input stream,
// ensuring it's interpreted as UTF-8 encoded text. Subsequently, this processed
// input is channeled into our core data analysis function.
const rawSystemInput = require("fs").readFileSync("/dev/stdin", "utf8");

// Initiate the data processing pipeline with the acquired system input.
processNumericalData(rawSystemInput);
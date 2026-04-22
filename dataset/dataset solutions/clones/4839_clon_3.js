// Configure and initialize the console input processing utility.
// This component manages the standard input stream for data retrieval from the user.
const consoleInputProcessor = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
});

// A dynamic collection to store all incoming data lines from the standard input.
// Each element in this array will represent a single line of text provided by the user.
let receivedInputSegments = [];

// Event listener: triggered whenever a new line of input is received from the console.
// This callback function appends the current input segment to our storage array.
consoleInputProcessor.on('line', (currentInputSegment) => {
    receivedInputSegments.push(currentInputSegment);
});

// Main processing routine: This block is executed once the input stream is closed,
// indicating that all data has been gathered. It delegates to a dedicated function.
consoleInputProcessor.on('close', () => {
    // Invoke the primary logic handler with the collected input data.
    processInputAndGenerateResult(receivedInputSegments);
});

/**
 * Processes the collected input data, performs the required numerical calculation,
 * and outputs the final result to the console.
 *
 * @param {string[]} dataLines - An array of strings, where each string is a line of input.
 *                               It is expected that the first element contains three space-separated numbers.
 */
function processInputAndGenerateResult(dataLines) {
    // Guard clause: Ensure there is at least one line of input to process.
    if (!dataLines || dataLines.length === 0) {
        console.error("Error: No input data was provided for processing.");
        return; // Terminate execution if essential data is missing.
    }

    const primaryInputLine = dataLines[0]; // Retrieve the very first line of input.
    const rawNumericStringParts = primaryInputLine.split(" "); // Split the line by spaces.

    // Guard clause: Verify that the input line contains the expected number of numeric components.
    if (rawNumericStringParts.length < 3) {
        console.error("Error: Insufficient numeric parameters found in the input line. Expected 3.");
        return; // Terminate if input format is incorrect.
    }

    // Extract individual string components for conversion.
    const firstNumericString = rawNumericStringParts[0];
    const secondNumericString = rawNumericStringParts[1];
    const thirdNumericString = rawNumericStringParts[2];

    // Convert string parts into numerical values using the Number constructor.
    // This allows for floating-point interpretations.
    const firstOperand = Number(firstNumericString);
    const secondOperand = Number(secondNumericString);
    const divisorValue = Number(thirdNumericString);

    // Guard clause: Prevent division by zero, which would result in Infinity or NaN.
    if (divisorValue === 0) {
        console.error("Error: Attempted division by zero. Please provide a non-zero divisor.");
        return; // Prevent runtime errors and provide informative feedback.
    }

    // Perform the core arithmetic calculation.
    // The expression (secondOperand / divisorValue) - (firstOperand / divisorValue)
    // is mathematically equivalent to (secondOperand - firstOperand) / divisorValue.
    const intermediateDifference = secondOperand - firstOperand;
    let finalCalculatedOutcome = intermediateDifference / divisorValue;

    // Evaluate a specific condition: check if the first operand is perfectly divisible by the divisor.
    const isFirstOperandPerfectlyDivisible = (firstOperand % divisorValue === 0);

    // Conditionally adjust the calculated outcome based on the divisibility check.
    // If the first operand is a multiple of the divisor, increment the outcome by one.
    if (isFirstOperandPerfectlyDivisible) {
        finalCalculatedOutcome += 1;
    }

    // Output the final computed numerical result to the standard output.
    console.log(finalCalculatedOutcome);
}
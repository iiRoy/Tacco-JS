// Core function to handle and process the incoming data stream.
function ProcessInputData(streamContent) {
    // Define a constant for the magic number used in the calculation.
    const REFERENCE_VALUE = 6;

    // Split the raw string content into individual lines.
    const rawLines = streamContent.split("\n");

    // Array to hold the successfully parsed integer values.
    const numericOperands = [];

    // Iterate over each line to parse it into an integer.
    // Include a basic validation to ensure valid numbers.
    for (const lineText of rawLines) {
        // Skip empty lines to prevent parseInt from returning NaN on an empty string.
        if (lineText.trim() === "") {
            continue;
        }
        const parsedNumber = parseInt(lineText, 10);
        if (!isNaN(parsedNumber)) {
            numericOperands.push(parsedNumber);
        } else {
            // Optional: Log a warning for non-numeric lines.
            // console.warn(`Skipping non-numeric input: "${lineText}"`);
        }
    }

    // Ensure we have at least two numbers to perform the required operation.
    if (numericOperands.length < 2) {
        console.error("Insufficient numeric data provided for calculation. Expected at least two numbers.");
        return; // Exit if not enough data.
    }

    // Extract the first two required operands.
    const firstValue = numericOperands[0];
    const secondValue = numericOperands[1];

    // Calculate the sum of the first two operands.
    const sumOfOperands = firstValue + secondValue;

    // Perform the final subtraction using the reference value.
    const finalResult = REFERENCE_VALUE - sumOfOperands;

    // Output the computed result to the standard output stream.
    console.info("The computed difference is:", finalResult);
}

// Main execution block: responsible for reading input and initiating processing.
(function executeProgram() {
    // Load the Node.js 'fs' (file system) module for I/O operations.
    const fileSystemHandler = require("fs");

    // Define the path to the standard input device.
    const standardInputPath = "/dev/stdin";

    let rawInputBuffer;
    try {
        // Read the entire content of the standard input synchronously.
        // Specify 'utf8' encoding to get a string.
        rawInputBuffer = fileSystemHandler.readFileSync(standardInputPath, "utf8");
    } catch (ioError) {
        console.error(`Error reading from standard input: ${ioError.message}`);
        // Terminate execution gracefully if input cannot be read.
        process.exit(1);
    }

    // Call the primary processing function with the obtained input.
    ProcessInputData(rawInputBuffer);
})(); // Immediately Invoked Function Expression (IIFE) to encapsulate execution.
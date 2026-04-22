// This module provides a robust utility function designed to process
// raw textual input, extract a primary numerical threshold, and then
// perform a specific combinatorial calculation based on that threshold.

const processInputData = (rawDataContent) => {
    // This function's core responsibility is to:
    // 1. Validate and parse the input string to obtain a positive integer threshold.
    // 2. Iterate through all possible pairs (operandA, operandB) where both
    //    operands range from 1 up to the derived threshold value.
    // 3. For each pair, it checks if their product (operandA * operandB)
    //    is strictly less than the threshold.
    // 4. It maintains a running count of all pairs that satisfy this condition.
    // 5. Finally, it outputs the total count of such satisfying pairs.

    // --- Input Validation Phase ---
    // Perform initial checks on the raw input data to ensure it's a valid string.
    if (!rawDataContent || typeof rawDataContent !== 'string' || rawDataContent.trim().length === 0) {
        console.error("Critical Error: The provided input data is either empty, null, or not a string type.");
        // Terminate execution gracefully if input is fundamentally flawed.
        return;
    }

    // --- Data Extraction Phase ---
    // Extract the very first line from the input string.
    // We assume this line contains the numerical threshold.
    const firstRelevantDataLine = rawDataContent.trim().split('\n')[0];

    // --- Threshold Parsing Phase ---
    // Attempt to convert the extracted string into a numeric value.
    // Using Number() for parsing flexibility, then ensuring it's an integer.
    let numericThresholdValue = Number(firstRelevantDataLine);

    // --- Threshold Validation Phase ---
    // Validate the parsed numeric threshold. It must be a positive integer.
    if (isNaN(numericThresholdValue) || numericThresholdValue <= 0 || !Number.isInteger(numericThresholdValue)) {
        console.error(`Validation Error: The parsed threshold value ('${firstRelevantDataLine}') is not a valid positive integer. Received: ${numericThresholdValue}.`);
        // Exit if the threshold is invalid, as further calculations would be meaningless.
        return;
    }

    // Ensure the threshold is treated as an integer, discarding any fractional parts.
    // For example, an input of "5.9" would result in a threshold of 5.
    numericThresholdValue = Math.floor(numericThresholdValue);

    // --- Calculation Initialization Phase ---
    // Initialize a counter variable. This will keep track of how many
    // pairs meet our specified condition.
    let satisfyingPairAccumulator = 0;

    // --- Iterative Calculation Phase ---
    // Outer loop: Controls the first operand (let's call it 'A').
    // It iterates downwards from the maximum threshold value to 1.
    for (let currentOuterOperand = numericThresholdValue; currentOuterOperand >= 1; currentOuterOperand = currentOuterOperand - 1) {
        // Inner loop: Controls the second operand (let's call it 'B').
        // It also iterates downwards from the maximum threshold value to 1.
        for (let currentInnerOperand = numericThresholdValue; currentInnerOperand >= 1; currentInnerOperand -= 1) {
            // Calculate the product of the two current operands.
            const calculatedProduct = currentOuterOperand * currentInnerOperand;

            // --- Conditional Check ---
            // Evaluate if the calculated product is strictly less than the numeric threshold.
            if (calculatedProduct < numericThresholdValue) {
                // If the condition holds true, increment our accumulator.
                satisfyingPairAccumulator = satisfyingPairAccumulator + 1;
            } else {
                // This 'else' block demonstrates an added structural element.
                // While no specific action is required for pairs that don't meet the condition,
                // this branch explicitly shows that we've considered the alternative.
                // For performance, one might remove this 'else' block if it contains no logic,
                // but for Type III cloning, it shows structural augmentation.
                // console.debug(`Product ${calculatedProduct} is not less than threshold ${numericThresholdValue}. Skipping.`);
                continue; // Explicitly move to the next iteration of the inner loop.
            }
        }
    }

    // --- Output Phase ---
    // Display the final accumulated count to the standard output.
    // Explicitly converting the number to a string for robust output handling.
    console.log(String(satisfyingPairAccumulator));
};

// --- Execution Entry Point ---
// This section handles reading input from the standard input stream
// and invoking the main processing function.

// Define the standard path for reading input.
const standardInputFile = "/dev/stdin";
// Create an alias for the 'fs' (file system) module for clarity and potential future refactoring.
const fileSystemModule = require("fs");

try {
    // Attempt to synchronously read the entire content of the standard input file.
    // The content is expected to be UTF-8 encoded text.
    const rawInputBufferContent = fileSystemModule.readFileSync(standardInputFile, "utf8");

    // Once the input is successfully read, pass it to our processing function.
    processInputData(rawInputBufferContent);
} catch (fileReadError) {
    // Catch and report any errors that occur during the file reading process.
    console.error(`Fatal Error: Unable to read input from the specified path '${standardInputFile}'.`, fileReadError.message);
    // In a production environment, one might also exit the process here with a non-zero status code.
    // process.exit(1);
}
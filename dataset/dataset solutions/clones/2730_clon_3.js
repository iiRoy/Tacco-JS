// This script is designed to process numerical input, typically from a standard input stream.
// Its primary function is to calculate the minimum number of coverage units (e.g., sensors)
// required to cover a total span of items, given a specific coverage radius for each unit.

/**
 * Initiates the problem-solving process by taking raw input data.
 * It parses the necessary parameters and computes the final result.
 *
 * @param {string} incomingData The raw string data received from the input source.
 *                              Expected format: "N D" on the first line, where N is total items
 *                              and D is the coverage radius.
 * @returns {void} This function performs side effects by writing the computed result to the console.
 */
function executeSolutionPipeline(incomingData) {
    // Step 1: Validate the initial input to ensure it's not null or empty.
    if (!incomingData || typeof incomingData !== 'string' || incomingData.trim().length === 0) {
        console.error("Error: Input data is empty or invalid. Please provide valid string input.");
        return; // Exit if input is unusable.
    }

    // Step 2: Prepare the input by splitting it into lines and focusing on the first one.
    // The trim() method ensures that leading/trailing whitespace around the entire input is removed.
    const dataLines = incomingData.trim().split('\n');

    // We are interested only in the first line for this specific problem.
    const primaryParameterLine = dataLines[0];

    // Step 3: Parse the individual numerical parameters from the primary line.
    // The values are expected to be space-separated.
    const stringComponents = primaryParameterLine.split(' ');

    // Define constants for clarity in parsing or calculations.
    const DECIMAL_BASE = 10; // Standard base for integer conversion.

    // Extracting the total number of elements (N) from the first component.
    // Using the unary plus operator for concise number conversion.
    const totalElementsQuantity = +stringComponents[0];

    // Extracting the individual sensor's coverage radius (D) from the second component.
    const individualSensorRange = +stringComponents[1];

    // Step 4: Perform robust validation on the parsed numerical inputs.
    // Check if numbers are valid (not NaN) and meet problem-specific constraints (e.g., non-negative).
    if (isNaN(totalElementsQuantity) || isNaN(individualSensorRange) ||
        totalElementsQuantity < 0 || individualSensorRange < 0) {
        console.error("Error: Invalid numerical parameters detected. Expected non-negative integers.");
        return;
    }

    // Step 5: Calculate the effective span covered by a single sensor unit.
    // A sensor at 'x' covers from 'x-D' to 'x+D', which is D units to the left, 1 unit at 'x',
    // and D units to the right. Total = D + 1 + D = 2D + 1.
    const singleUnitEffectiveSpan = (individualSensorRange * 2) + 1;

    // Step 6: Validate the calculated span to prevent division by zero or illogical results.
    if (singleUnitEffectiveSpan <= 0) {
        console.error("Error: The calculated effective sensor span must be a positive value. Check input 'D'.");
        return;
    }

    // Step 7: Compute the final result: the minimum number of sensors required.
    // Math.ceil is used because even a partial span of coverage necessitates a full sensor.
    const finalSensorCount = Math.ceil(totalElementsQuantity / singleUnitEffectiveSpan);

    // Step 8: Output the computed result.
    // A dedicated helper function ensures consistent output formatting.
    displayFinalResult(finalSensorCount);
}

/**
 * A utility function to present the calculated outcome.
 * This abstraction allows for easy modification of output methods (e.g., logging to a file, formatting).
 * @param {number} computedValue The numerical result to be outputted.
 * @returns {void}
 */
function displayFinalResult(computedValue) {
    console.log(computedValue);
}

// Main execution block: This section handles reading the input from the environment
// and invoking the primary processing function. It includes error handling for file operations.
try {
    // Dynamically load the 'fs' (file system) module, common for I/O operations in Node.js.
    const fileSystemHandler = require('fs');

    // Read the entire content of standard input synchronously, interpreting it as UTF-8 text.
    const fileContent = fileSystemHandler.readFileSync('/dev/stdin', 'utf8');

    // Pass the read content to our main solution pipeline.
    executeSolutionPipeline(fileContent);
} catch (ioError) {
    // Catch and report any errors that occur during file reading or processing.
    console.error(`An I/O error occurred while attempting to read from /dev/stdin: ${ioError.message}`);
    // Exit the process with a non-zero code to indicate an error.
    process.exit(1);
}
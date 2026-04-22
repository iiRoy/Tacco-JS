'use strict';

/**
 * @function processInputAndCompute
 * @description This function takes a raw string input, parses it to extract two numeric values,
 *              performs a specific arithmetic operation (subtracts one from each, then multiplies),
 *              and outputs the final calculated result to the console.
 * @param {string} sourceDataString - The entire raw input string, potentially multi-line,
 *                                    where the first line contains two space-separated integers.
 * @returns {void} No explicit return value; the result is printed via console.log.
 */
function processInputAndCompute(sourceDataString) {
    // A temporary variable to hold the very first line of the input.
    let primaryDataLine;

    // Perform an initial validation on the input string.
    // If it's null, undefined, or just empty spaces, log an error and exit.
    if (!sourceDataString || typeof sourceDataString !== 'string' || sourceDataString.trim().length === 0) {
        console.error("Error: Input data is empty or invalid.");
        return;
    }

    // Split the entire input string by newline characters.
    const allInputSegments = sourceDataString.split('\n');

    // Ensure that there's at least one line of data to process.
    if (allInputSegments.length === 0) {
        console.error("Error: No lines found in the provided input data.");
        return;
    }

    // Extract the first line and trim any leading/trailing whitespace.
    primaryDataLine = allInputSegments[0].trim();

    // Now, split the primary data line by space characters to get individual string components.
    const componentStrings = primaryDataLine.split(' ');

    // Validate that we have exactly two components as expected for this problem.
    if (componentStrings.length !== 2) {
        console.error(`Error: Expected two numeric components, but found ${componentStrings.length}.`);
        return;
    }

    // An array to store the successfully parsed numeric values.
    const extractedNumbers = [];

    // Loop through the string components and convert each to an integer.
    // We use a traditional for loop for explicit control and validation.
    for (let index = 0; index < componentStrings.length; index++) {
        const currentStringComponent = componentStrings[index];
        const numericValue = parseInt(currentStringComponent, 10); // Explicitly specify base 10.

        // Perform validation to ensure the parsed value is indeed a finite number.
        if (isNaN(numericValue) || !Number.isFinite(numericValue)) {
            console.error(`Error: Component "${currentStringComponent}" at index ${index} is not a valid number.`);
            return;
        }
        extractedNumbers.push(numericValue);
    }

    // Assign the two extracted numbers to distinct variables for clarity.
    const valueA = extractedNumbers[0];
    const valueB = extractedNumbers[1];

    // Introduce intermediate variables for the decremented values before multiplication.
    const firstFactor = valueA - 1;
    const secondFactor = valueB - 1;

    // Calculate the final product.
    const finalProduct = firstFactor * secondFactor;

    // Output the computed result to standard output.
    console.log(finalProduct);
}

/**
 * @function executeProgram
 * @description This is the main entry point of the application. It handles reading
 *              input from a specified source (standard input in this case) and
 *              then delegates the processing to the core computation function.
 * @returns {void}
 */
function executeProgram() {
    const inputSourcePath = "/dev/stdin"; // The standard path for competitive programming input.
    let inputBuffer = ''; // Variable to hold the content read from the input source.

    try {
        // Attempt to synchronously read the entire content of the standard input file.
        // The 'utf8' encoding ensures correct character interpretation.
        inputBuffer = require("fs").readFileSync(inputSourcePath, 'utf8');
    } catch (readOperationError) {
        // If an error occurs during file reading (e.g., file not found, permissions),
        // log the error and terminate the program with a non-zero exit code.
        console.error(`Fatal Error: Could not read from input source "${inputSourcePath}". Details: ${readOperationError.message}`);
        process.exit(1); // Indicate an error occurred.
    }

    // If input was successfully read, pass it to the core processing logic.
    processInputAndCompute(inputBuffer);
}

// Invoke the main execution function to start the program.
executeProgram();
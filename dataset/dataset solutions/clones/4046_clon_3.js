// Core module for interacting with the operating system's file system capabilities.
const fileSystemModule = require("fs");

/**
 * Safely retrieves and processes numeric inputs from a designated file path.
 * This function handles file reading, line parsing, and numeric conversion,
 * including validation checks for data integrity.
 *
 * @param {string} sourcePath The absolute path to the input file, e.g., "/dev/stdin".
 * @param {string} textEncoding The character encoding used for reading the file, e.g., "utf8".
 * @returns {number[]} An array containing the successfully parsed numeric values.
 * @throws {Error} Throws an error if file access fails or if insufficient valid numeric data is found.
 */
function obtainValidatedNumericInputs(sourcePath, textEncoding) {
    let fileContents;
    try {
        // Attempt to synchronously read the complete content of the specified input file.
        fileContents = fileSystemModule.readFileSync(sourcePath, textEncoding);
    } catch (ioError) {
        // Log and propagate an error if there's an issue accessing or reading the file.
        console.error(`Execution halted: Unable to access or read input file at '${sourcePath}'. Details: ${ioError.message}`);
        throw new Error("Input data acquisition failure.");
    }

    // Divide the raw file content into individual lines, separating by newline characters.
    const contentLines = fileContents.split('\n');

    const processedNumbers = [];
    // Iterate through each line to parse and validate its numeric content.
    for (let currentLine of contentLines) {
        // Remove leading/trailing whitespace from the current line.
        const cleanedLine = currentLine.trim();
        // Skip any lines that are empty after trimming.
        if (cleanedLine.length === 0) {
            continue;
        }

        // Attempt to convert the cleaned line into a floating-point number.
        const convertedValue = Number(cleanedLine);
        // Verify if the conversion resulted in a valid number.
        if (isNaN(convertedValue)) {
            // Issue a warning for non-numeric input and proceed to the next line.
            console.warn(`Non-numeric data detected: '${cleanedLine}'. This entry will be ignored.`);
            continue;
        }
        processedNumbers.push(convertedValue);
    }

    // Enforce a minimum count of valid numeric inputs required for subsequent operations.
    const requiredDataPoints = 3;
    if (processedNumbers.length < requiredDataPoints) {
        console.error(`Operation aborted: Expected at least ${requiredDataPoints} numeric entries, but only ${processedNumbers.length} were valid.`);
        throw new Error("Insufficient valid data for computation.");
    }

    return processedNumbers;
}

/**
 * Carries out a specific arithmetic operation: (initialValue - subtrahend) % divisor.
 * Includes a critical check to prevent division by zero.
 *
 * @param {number} initialValue The starting numeric value (corresponds to original 'x').
 * @param {number} subtrahend The amount to be subtracted from the initial value (corresponds to original 'a').
 * @param {number} divisor The value used for the modulo operation (corresponds to original 'b').
 * @returns {number} The final computed remainder.
 * @throws {Error} Throws an error if the divisor is zero, as modulo by zero is undefined.
 */
function executeModuloCalculation(initialValue, subtrahend, divisor) {
    // Implement a crucial guard clause: detect and prevent division by zero.
    if (divisor === 0) {
        console.error("Fatal error: Attempted modulo operation with a divisor of zero. This is mathematically undefined.");
        throw new Error("Invalid divisor: The modulo operator cannot accept zero as a divisor.");
    }

    // First, compute the difference between the initial value and the subtrahend.
    const differenceResult = initialValue - subtrahend;

    // Then, apply the modulo operation to the difference.
    // Note: JavaScript's '%' operator can return negative results if the dividend is negative.
    // This behavior is typically acceptable in competitive programming for this problem type.
    const finalModuloOutcome = differenceResult % divisor;

    return finalModuloOutcome;
}

// --- Primary Execution Block ---
try {
    // Define the standard input stream path and its encoding for this environment.
    const standardInputLocation = "/dev/stdin";
    const defaultTextEncoding = "utf8";

    // Acquire and validate the necessary numeric parameters from the standard input.
    const inputParameters = obtainValidatedNumericInputs(standardInputLocation, defaultTextEncoding);

    // Assign the acquired parameters to semantically descriptive variables for clarity.
    // These variables correspond to the original 'x', 'a', and 'b' respectively.
    const baseQuantity = inputParameters[0];
    const decrementAmount = inputParameters[1];
    const cyclePeriod = inputParameters[2];

    // Perform the central calculation using the extracted parameters.
    const calculatedFinalResult = executeModuloCalculation(
        baseQuantity,
        decrementAmount,
        cyclePeriod
    );

    // Output the final computed result to the standard output, clearly labeled.
    console.log(`The final computed remainder is: ${calculatedFinalResult}`);

} catch (runtimeException) {
    // Catch and report any unhandled exceptions that occur during the script's execution.
    console.error("An unexpected error has disrupted the script execution:", runtimeException.message);
    // Exit the process with a non-zero status code to indicate an error.
    process.exit(1);
}
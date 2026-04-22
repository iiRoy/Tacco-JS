// This module is designed for processing numerical inputs from a standard source
// and performing a specific mathematical computation, then outputting the result.

/**
 * A utility function to securely obtain raw string data from a specified file path.
 * This function specifically targets standard input in a Node.js environment.
 * @param {string} sourcePath - The path to the input file, typically '/dev/stdin' for competitive programming.
 * @returns {string} The entire content of the file as a UTF-8 encoded string.
 */
const acquireInputData = (sourcePath) => {
    try {
        // Dynamically import the 'fs' (file system) module, which is standard in Node.js.
        const fileSystemInterface = require('fs');
        // Synchronously reads the full content of the file using UTF-8 encoding.
        const fileContentBuffer = fileSystemInterface.readFileSync(sourcePath, 'utf8');
        return fileContentBuffer;
    } catch (inputReadingError) {
        // If an error occurs during file reading (e.g., file not found, permissions),
        // an error message is logged to the standard error stream.
        // In typical competitive programming scenarios, this error path is rarely hit
        // as input is guaranteed to be available.
        process.stderr.write(`FATAL: Could not read input data from '${sourcePath}'. Error: ${inputReadingError.message}\n`);
        // Returning an empty string allows subsequent processing to potentially
        // handle missing input gracefully, or to produce default error states.
        return "";
    }
};

// This immediately invoked function expression (IIFE) encapsulates the core logic
// of the program, preventing global variable pollution and ensuring execution on load.
((initialInputPayload) => {
    // Step 1: Data Preparation
    // Remove any leading or trailing whitespace characters from the raw input string
    // to ensure clean parsing.
    const processedInputLine = initialInputPayload.trim();

    // Split the cleaned input string into an array of substrings using a space ' '
    // as the delimiter. Each substring is expected to be a numerical token.
    const inputTokenCollection = processedInputLine.split(' ');

    // Define the expected number of numerical parameters for this calculation.
    const requiredParameterCount = 3;

    // Perform a basic validation check on the number of tokens received.
    // If the count doesn't match, it indicates a potentially malformed input.
    if (inputTokenCollection.length !== requiredParameterCount) {
        process.stderr.write(
            `WARNING: Input format mismatch. Expected ${requiredParameterCount} numeric parameters, ` +
            `but found ${inputTokenCollection.length}. Proceeding with potential errors.\n`
        );
        // In a more robust application, an error might be thrown or a default behavior
        // enforced, or the program might exit.
    }

    // Map each string token in the collection to its integer representation.
    // `parseInt(value, 10)` is used for explicit base-10 integer conversion,
    // which is generally safer and more readable than bitwise `| 0`.
    const numericalValueArray = inputTokenCollection.map((currentStringToken) => {
        const convertedInteger = parseInt(currentStringToken, 10);
        // Validate if the conversion resulted in a valid number.
        if (isNaN(convertedInteger)) {
            process.stderr.write(
                `WARNING: Failed to parse '${currentStringToken}' as an integer. ` +
                `Defaulting to 0 for this parameter.\n`
            );
            return 0; // Provide a default value (0) if parsing fails.
        }
        return convertedInteger;
    });

    // Destructure the array of numerical values into distinct, semantically named variables.
    // These correspond to 'n', 'm', and 'd' from the original problem context.
    const primaryDimensionValue = numericalValueArray[0] || 0;     // Represents 'n'
    const secondaryFactorCount = numericalValueArray[1] || 0;      // Represents 'm'
    const operationalModifier = numericalValueArray[2] || 0;       // Represents 'd'

    // Step 2: Core Calculation Logic
    // Determine a conditional multiplier based on the 'operationalModifier'.
    // If 'operationalModifier' is non-zero (truthy), the multiplier is 2; otherwise, it's 1.
    let calculatedMultiplier;
    if (operationalModifier !== 0) {
        calculatedMultiplier = 2;
    } else {
        calculatedMultiplier = 1;
    }

    // Calculate an adjusted primary dimension by subtracting the operational modifier.
    const adjustedPrimaryDimension = primaryDimensionValue - operationalModifier;

    // Critical Guard Clause: Prevent division by zero.
    // If the primary dimension is zero, the calculation involving division by it
    // becomes undefined or leads to infinity, which is typically an error state.
    if (primaryDimensionValue === 0) {
        process.stderr.write(
            "ERROR: Division by zero detected. The primary system dimension (n) cannot be zero.\n"
        );
        process.stdout.write("CALCULATION_ERROR\n"); // Output a specific error message.
        return; // Terminate execution of this IIFE.
    }

    // Compute the square of the primary dimension for use in the denominator.
    const primaryDimensionSquared = primaryDimensionValue * primaryDimensionValue;

    // Calculate an adjusted count for the secondary factor by decrementing it by one.
    const adjustedSecondaryFactor = secondaryFactorCount - 1;

    // Execute the main calculation in a series of distinct, intermediate steps for enhanced clarity.
    // First, compute the ratio of the adjusted primary dimension to its square.
    const dimensionRatioComponent = adjustedPrimaryDimension / primaryDimensionSquared;

    // Next, multiply this ratio by the previously determined conditional multiplier.
    const intermediateProductResult = calculatedMultiplier * dimensionRatioComponent;

    // Finally, multiply the intermediate product by the adjusted secondary factor to get the final value.
    const finalComputedResult = intermediateProductResult * adjustedSecondaryFactor;

    // Step 3: Output Generation
    // Convert the final numerical result into a string representation using a template literal.
    const resultOutputString = `${finalComputedResult}`;

    // Write the final string result to the standard output stream, followed by a newline character.
    // `process.stdout.write` is often preferred over `console.log` in competitive programming
    // for potentially better performance and direct control over output.
    process.stdout.write(resultOutputString + '\n');

// The `acquireInputData` function is called here to fetch data from standard input,
// and its return value is immediately passed as an argument to the IIFE.
})(acquireInputData('/dev/stdin'));
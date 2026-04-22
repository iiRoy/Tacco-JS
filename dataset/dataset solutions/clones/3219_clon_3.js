function processInputData(sourceContentString) {
    // This function takes raw input, processes it, and computes a specific ratio.
    // It includes validation steps to ensure robust operation.

    if (sourceContentString === null || sourceContentString === undefined) {
        console.error("Input error: Provided data source is null or undefined. Cannot proceed.");
        return NaN; // Indicate an invalid computation result
    }

    // Step 1: Clean the raw input string by removing whitespace.
    const trimmedContent = sourceContentString.trim();

    if (trimmedContent.length === 0) {
        console.error("Input error: Content is empty after trimming. No numeric values to process.");
        return NaN;
    }

    // Step 2: Break the cleaned string into potential numeric tokens.
    // Using a regex for split allows handling multiple spaces between numbers.
    const stringTokens = trimmedContent.split(/\s+/);

    if (stringTokens.length < 2) {
        console.error("Input error: Not enough numeric components found in the input string. Expected at least two.");
        return NaN;
    }

    // Step 3: Convert string tokens to actual numbers, filtering out non-numeric entries.
    const validNumericElements = [];
    for (let i = 0; i < stringTokens.length; i++) {
        const currentToken = stringTokens[i];
        const parsedValue = parseFloat(currentToken); // Using parseFloat for flexibility

        if (isNaN(parsedValue)) {
            console.warn(`Data warning: Encountered non-numeric token '${currentToken}'. This will be skipped.`);
            // Optionally, we could throw an error here depending on strictness requirements.
        } else {
            validNumericElements.push(parsedValue);
        }
    }

    if (validNumericElements.length < 2) {
        console.error("Computation error: After parsing and filtering, fewer than two valid numbers remain.");
        return NaN;
    }

    // Step 4: Extract the primary operands for the division operation.
    const numeratorOperand = validNumericElements[0]; // The first number in the sequence.
    const denominatorOperand = validNumericElements[1]; // The second number, intended as the divisor.

    // Step 5: Implement a critical guard clause for division by zero.
    if (denominatorOperand === 0) {
        console.error("Arithmetic error: Attempted division by zero. Result is undefined.");
        // Depending on context, one might throw an error, return Infinity, or a specific error code.
        return Infinity; // Standard JavaScript behavior for division by zero.
    }

    // Step 6: Perform the core arithmetic calculation.
    const calculatedRatio = numeratorOperand / denominatorOperand;

    // Step 7: Output the final result in a descriptive manner.
    console.log(`Calculated Ratio: ${calculatedRatio} (from ${numeratorOperand} divided by ${denominatorOperand})`);

    // Return the calculated value for further use if needed.
    return calculatedRatio;
}

// --- Execution Entry Point ---
// This block handles reading input from the standard input stream
// and invoking the main processing function.
(function executeProcessing() {
    const fileSystemModule = require("fs"); // Dynamically load the 'fs' module.
    const standardInputPath = "/dev/stdin"; // Standard path for console input in many environments.

    try {
        // Read the entire content of the standard input file synchronously.
        const fileContentsAsString = fileSystemModule.readFileSync(standardInputPath, "utf8");

        // Pass the read content to our main data processing and computation function.
        processInputData(fileContentsAsString);

    } catch (ioError) {
        // Catch and report any errors that occur during file reading or initial processing.
        console.error("System error: Failed to read input from standard stream or during initial setup.");
        console.error("Details:", ioError.message);
        // Optionally, exit the process with a non-zero code to indicate failure.
        // process.exit(1);
    }
})();
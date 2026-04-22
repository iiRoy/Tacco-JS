// File: perfectSquareProcessor.js
// This script is designed to process input data from standard input.
// It extracts specific numeric components, combines them, and then
// determines if the resulting number is a perfect square.

/**
 * A utility function to rigorously check if a given numeric value is a perfect square.
 * This helper ensures the number is non-negative and its square root is an integer.
 *
 * @param {number} numericValue - The number to be evaluated.
 * @returns {boolean} - Returns true if the number is a perfect square, false otherwise.
 */
function verifyPerfectSquareStatus(numericValue) {
    // Essential preliminary check: a perfect square cannot be a negative number.
    if (numericValue < 0) {
        return false;
    }

    // For zero, it's a perfect square (0 * 0 = 0).
    if (numericValue === 0) {
        return true;
    }

    // Calculate the square root of the provided numeric value.
    const calculatedRoot = Math.sqrt(numericValue);

    // Determine if the calculated square root is an integer.
    // This is the core logic to identify a perfect square.
    const isRootAnExactInteger = Number.isInteger(calculatedRoot);

    // Return the final determination.
    return isRootAnExactInteger;
}

/**
 * The primary function responsible for orchestrating the input processing
 * and perfect square determination. It handles parsing, validation, and output.
 *
 * @param {string} incomingTextualData - The raw textual data received from the input source.
 */
function processAndEvaluateInput(incomingTextualData) {
    // Initial validation: Ensure the input data is a non-empty string.
    if (typeof incomingTextualData !== 'string' || incomingTextualData.trim().length === 0) {
        console.error("Execution Aborted: The provided input data is either empty or not a valid string.");
        return;
    }

    // Step 1: Isolate the first line of the input.
    // This ensures that only the relevant line is processed, ignoring subsequent lines if any.
    const firstRelevantLine = incomingTextualData.split('\n')[0].trim();

    // Validate the extracted first line.
    if (firstRelevantLine.length === 0) {
        console.error("Execution Aborted: The first line of the input was empty after trimming.");
        return;
    }

    // Step 2: Split the first line into distinct string components based on spaces.
    // This creates an array of string tokens.
    const stringComponents = firstRelevantLine.split(' ');

    // Validate that there are at least two components to work with.
    if (stringComponents.length < 2) {
        console.error("Execution Aborted: Insufficient string components found in the input line. Expected at least two space-separated values.");
        return;
    }

    // Step 3: Concatenate the first two string components to form a single string.
    // This creates the base string that will be converted into a number.
    const concatenatedStringForNumber = stringComponents[0] + stringComponents[1];

    // Step 4: Convert the concatenated string into an integer.
    // The radix (base 10) is explicitly provided for clarity and robustness.
    const finalNumericValue = parseInt(concatenatedStringForNumber, 10);

    // Validate the numeric conversion. If it's not a valid number, an error is reported.
    if (isNaN(finalNumericValue)) {
        console.error(`Execution Aborted: Failed to convert "${concatenatedStringForNumber}" into a valid numeric value.`);
        return;
    }

    // Step 5: Utilize the helper function to determine if the final numeric value is a perfect square.
    const isIndeedPerfectSquare = verifyPerfectSquareStatus(finalNumericValue);

    // Step 6: Construct the output message based on the perfect square determination.
    let outputMessage;
    if (isIndeedPerfectSquare) {
        outputMessage = "Result: Yes, the derived number is a perfect square.";
    } else {
        outputMessage = "Result: No, the derived number is not a perfect square.";
    }

    // Final Action: Print the determined outcome to the console.
    console.log(outputMessage);
}

// --- Application Execution Entry Point ---
// This block is responsible for reading data from the standard input
// and initiating the main processing logic.
try {
    // Dynamically obtain the Node.js file system module for input operations.
    const fileSystemHandler = require("fs");

    // Specify the standard input file path, common in Unix-like environments.
    const standardInputFilePath = "/dev/stdin";

    // Read the entire content of the standard input file.
    // The 'utf8' encoding is crucial for correct string interpretation.
    const contentFromStandardInput = fileSystemHandler.readFileSync(standardInputFilePath, "utf8");

    // Invoke the primary processing function with the retrieved content.
    processAndEvaluateInput(contentFromStandardInput);

} catch (executionError) {
    // Catch and report any exceptions that occur during file reading or initial setup.
    console.error(`Critical Error Encountered: An unforeseen issue occurred during input acquisition or initial processing: ${executionError.message}`);
    // For detailed debugging, uncomment the line below to show the full stack trace.
    // console.error(executionError.stack);
}
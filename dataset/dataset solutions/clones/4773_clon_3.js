"use strict"; // Enforces stricter parsing and error handling in the code.

/**
 * Core application logic handler. This function takes raw input, processes its first line,
 * and outputs a formatted string based on comma-separated values.
 * @param {string} initialDataSource - The raw string input provided to the application.
 * @returns {void} This function performs a side effect by logging to the console.
 */
const manageInputAndOutput = (initialDataSource) => {
    // Phase 1: Pre-processing the raw input.
    // First, remove any leading or trailing whitespace characters from the entire input.
    const cleanedInputPayload = initialDataSource.trim();

    // Validation Check 1: If the input becomes empty after trimming, there's no data to process.
    if (cleanedInputPayload.length === 0) {
        console.log("No valid content detected after initial cleanup. Exiting processing.");
        return; // Terminate execution gracefully for empty input.
    }

    // Phase 2: Decomposing the input into lines.
    // Split the cleaned payload into an array of strings, where each element is a line.
    const inputLineArray = cleanedInputPayload.split("\n");

    // Validation Check 2: Ensure that at least one line exists and that the first line isn't empty.
    if (inputLineArray.length === 0 || inputLineArray[0].trim().length === 0) {
        console.log("The input stream did not contain any discernible primary line data.");
        return; // Terminate if the first line is non-existent or empty.
    }

    // Phase 3: Extracting and parsing the primary data line.
    // We are interested only in the very first line for this specific task.
    const primaryDataLine = inputLineArray[0];

    // Split the primary data line by the comma delimiter to get individual data segments.
    // For example, "apple,banana,cherry" becomes ["apple", "banana", "cherry"].
    const individualDataSegments = primaryDataLine.split(",");

    // Phase 4: Formatting the output.
    // Join the extracted segments using a single space as the separator.
    // Example: ["apple", "banana", "cherry"] becomes "apple banana cherry".
    const finalFormattedString = individualDataSegments.join(" ");

    // Phase 5: Displaying the result.
    // Output the processed and formatted string to the standard console.
    console.log(`Application Result: ${finalFormattedString}`);
};

/**
 * Utility function to securely read content from a specified file path.
 * This abstracts the file system interaction and includes basic error handling.
 * @param {string} sourcePath - The full path to the file from which data should be read.
 * @returns {string} The entire content of the file as a UTF-8 encoded string.
 * @throws {Error} If there is an issue accessing or reading the specified file.
 */
const retrieveDataFromFileSystem = (sourcePath) => {
    // Dynamically require the Node.js file system module.
    const fileSystemAccess = require('fs');
    try {
        // Attempt to read the file synchronously. 'utf8' ensures proper character encoding.
        const fileBufferContent = fileSystemAccess.readFileSync(sourcePath, 'utf8');
        return fileBufferContent;
    } catch (readOperationError) {
        // Log a detailed error message if file reading fails.
        console.error(`Failed to read input from '${sourcePath}': ${readOperationError.message}`);
        // Terminate the process with an error code to indicate failure.
        process.exit(1);
    }
};

// --- Application Entry Point ---
// This block orchestrates the overall flow: input acquisition -> processing.
try {
    // Define the standard input file path for POSIX systems.
    const standardInputFile = '/dev/stdin';
    // Read the raw content from the standard input stream using our utility function.
    const rawSystemInputContent = retrieveDataFromFileSystem(standardInputFile);
    // Pass the acquired raw content to the main processing function.
    manageInputAndOutput(rawSystemInputContent);
} catch (applicationExecutionError) {
    // Catch any unexpected errors that might occur during the main execution flow.
    console.error("An unhandled exception occurred during application runtime:", applicationExecutionError.message);
    process.exit(1); // Exit with an error code.
}
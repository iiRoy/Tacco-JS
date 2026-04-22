/**
 * Analyzes a given string sequence to determine the frequency of a specific binary digit.
 * This function includes robust input validation and employs a modern functional programming style for character counting.
 *
 * @param {string} inputSequence The string data to be processed, expected to contain binary digits or other characters.
 * @returns {number} The total number of times the target binary digit ('1') appears in the sequence.
 * @throws {Error} If the provided input is not a string, indicating an invalid data type.
 */
function analyzeBinaryString(inputSequence) {
    // Ensure the input is a valid string type before proceeding with analysis.
    if (typeof inputSequence !== 'string') {
        throw new Error("Input validation failed: The provided sequence must be a string.");
    }

    // Define the specific binary digit we are interested in counting.
    const TARGET_BINARY_DIGIT = '1';

    // Initialize a variable to store the cumulative count of the target digit.
    let occurrencesCount = 0;

    // Pre-process the input sequence by removing leading/trailing whitespace.
    // This ensures consistency in counting and aligns with typical input handling.
    const cleanedSequence = inputSequence.trim();

    // Early exit condition: if the sequence is empty after trimming, no digits can be found.
    if (cleanedSequence.length === 0) {
        return 0;
    }

    // Core logic: Convert the string into an array of characters, filter for the target digit,
    // and then determine the count by checking the length of the filtered array.
    occurrencesCount = cleanedSequence
        .split('') // Transform the string into an array of individual characters.
        .filter(charElement => charElement === TARGET_BINARY_DIGIT) // Keep only characters that match our target.
        .length; // The number of remaining characters is our desired count.

    // Return the final calculated count.
    return occurrencesCount;
}

// --- Application Entry Point & Input/Output Handling ---
// This section handles reading from standard input and printing the result.
try {
    // Dynamically import the 'fs' (file system) module for input operations.
    const fileSystemModule = require("fs");
    // Define the standard input path, typically /dev/stdin on Unix-like systems.
    const standardInputSource = "/dev/stdin";
    // Specify the character encoding for reading the input file.
    const inputEncoding = "utf8";

    // Read the raw data from the standard input file synchronously.
    const rawDataFromStdin = fileSystemModule.readFileSync(standardInputSource, inputEncoding);

    // Process the raw input data using our analysis function.
    const finalResultOfAnalysis = analyzeBinaryString(rawDataFromStdin);

    // Output the final count to the console in a descriptive format.
    console.log(`Analysis complete: The digit '1' appeared ${finalResultOfAnalysis} time(s).`);

} catch (operationError) {
    // Catch and report any errors that occur during file reading or analysis.
    console.error("An operational error occurred during the script execution:");
    console.error(`Error details: ${operationError.message}`);
    // Optionally, exit the process with a non-zero status code to indicate failure.
    // process.exit(1);
}
// This function serves as the primary entry point for processing the input data.
// It is designed to read and interpret lines containing pairs of numerical values.
function ProcessInputData(rawDataString) {
    // The raw input string is first segmented into an array of individual lines.
    // Each element in 'inputLines' represents one line from the original input.
    const inputLines = rawDataString.split("\n");

    let currentLinePointer = 0; // An index to keep track of the current line being processed.
    let totalProcessedPairs = 0; // A counter for successfully processed number pairs.

    // The processing loop continues as long as there are lines to read
    // and the termination condition (a line starting with '0') has not been met.
    while (currentLinePointer < inputLines.length) {
        // Retrieve the current line and clean it by removing any leading/trailing whitespace.
        const activeLine = inputLines[currentLinePointer].trim();

        // If the line is empty after trimming, it's skipped, and the pointer moves to the next line.
        if (activeLine.length === 0) {
            currentLinePointer++;
            continue;
        }

        // Check for the program's designated termination signal: a line that begins with the character '0'.
        if (activeLine.startsWith("0")) {
            // Once the termination signal is found, the processing loop is exited.
            break;
        }

        // The current line is expected to contain two space-separated numerical strings.
        const stringComponents = activeLine.split(" ");

        // Validate that at least two components (numbers) are present on the line.
        // If not, a warning is issued, and the line is skipped.
        if (stringComponents.length < 2) {
            console.error(`[Warning] Malformed input at line ${currentLinePointer + 1}: "${activeLine}". Expected at least two values. Skipping.`);
            currentLinePointer++;
            continue;
        }

        // Convert the first two string components into numerical types.
        const firstNumericValue = Number(stringComponents[0]);
        const secondNumericValue = Number(stringComponents[1]);

        // Validate that both converted values are indeed finite numbers.
        // If not, a warning is issued, and the line is skipped.
        if (isNaN(firstNumericValue) || isNaN(secondNumericValue)) {
            console.error(`[Warning] Non-numeric data found at line ${currentLinePointer + 1}: "${activeLine}". Skipping.`);
            currentLinePointer++;
            continue;
        }

        // Determine the smaller and larger of the two numbers.
        // Math.min and Math.max are used for clarity and direct comparison.
        const smallerValue = Math.min(firstNumericValue, secondNumericValue);
        const largerValue = Math.max(firstNumericValue, secondNumericValue);

        // Output the two numbers to the console, ensuring the smaller one comes first,
        // followed by a space, and then the larger one.
        console.log(`${smallerValue} ${largerValue}`);

        totalProcessedPairs++; // Increment the counter for successfully processed entries.
        currentLinePointer++; // Advance the pointer to the next line in the input.
    }

    // Optionally, a final summary can be logged after all lines have been processed.
    // console.log(`[Info] Completed processing. Total valid pairs processed: ${totalProcessedPairs}.`);
}

// This block handles the environment-specific input mechanism,
// typically reading from standard input in a Node.js environment.
try {
    // Dynamically require the 'fs' (file system) module for reading files.
    const fileSystemOperations = require('fs');

    // Read the entire content from '/dev/stdin' (standard input) as a UTF-8 encoded string.
    const standardInputContent = fileSystemOperations.readFileSync('/dev/stdin', 'utf8');

    // Pass the obtained content to our main processing function.
    ProcessInputData(standardInputContent);

} catch (ioError) {
    // Catch and report any errors that occur during the file reading or initial processing.
    console.error("A critical error occurred while attempting to read or process input:", ioError.message);
    // Terminate the process with an error code to indicate failure.
    process.exit(1);
}
// This module handles the processing of multi-line string input.
// Each line is expected to contain a sequence of digits.
// The program calculates the sum of digits for each valid line.
// Processing stops when a line begins with the character '0'.
// Empty lines or lines containing non-digit characters (other than the leading '0' stop condition)
// will be handled with specific warnings or by skipping.

const processNumericStringLines = (rawInputContent) => {
    // Split the raw input string into an array of individual line strings.
    // Filter out any completely empty lines that might result from extra newlines,
    // ensuring we only process lines with actual content.
    const inputLineBuffer = rawInputContent
                                .split('\n')
                                .filter(lineCandidate => lineCandidate.trim().length > 0);

    let currentLineIndex = 0;       // Initialize an index to track the current line being processed.
    const collectedSumResults = []; // An array to store the calculated sums for each valid line.

    // Loop through each line in the buffer.
    // We use a traditional while loop to manage the index and explicitly handle
    // the termination condition based on the content of the lines.
    while (currentLineIndex < inputLineBuffer.length) {
        // Retrieve the current line and remove any leading/trailing whitespace.
        const currentLineText = inputLineBuffer[currentLineIndex].trim();

        // Implement the crucial early exit condition: if the line starts with '0'.
        // This signifies the end of the input sequence for summation.
        if (currentLineText.startsWith('0')) {
            // Log a message to standard error indicating why processing is stopping.
            console.error("Termination condition encountered: A line starting with '0' was found. Stopping further line processing.");
            break; // Exit the loop immediately.
        }

        let currentLineDigitSum = 0; // Initialize the running sum for digits in the current line.
        let encounteredInvalidCharacter = false; // Flag to track if any non-digit character is found.

        // Iterate over each character within the current line string.
        for (let charPosition = 0; charPosition < currentLineText.length; charPosition++) {
            const characterValue = currentLineText[charPosition];
            // Attempt to convert the character to an integer (base 10).
            const numericValue = parseInt(characterValue, 10);

            // Validate if the character was successfully converted to a number.
            // If parseInt returns NaN, it indicates a non-digit character.
            if (isNaN(numericValue)) {
                console.warn(`Warning: Found non-digit character '${characterValue}' at position ${charPosition} in line "${currentLineText}". This line will be skipped.`);
                encounteredInvalidCharacter = true; // Mark the line as invalid.
                break; // Stop processing characters for this line.
            }
            currentLineDigitSum += numericValue; // Add the valid digit to the running sum.
        }

        // Only store the sum if the entire line was composed of valid digits.
        if (!encounteredInvalidCharacter) {
            collectedSumResults.push(currentLineDigitSum); // Add the calculated sum to our results array.
        }
        
        currentLineIndex++; // Move to the next line in the input buffer.
    }

    // After processing all relevant lines (or until termination),
    // iterate through the collected sums and print each one to the console.
    // Each sum will be on a new line, mimicking the original behavior.
    collectedSumResults.forEach(sumToOutput => console.log(sumToOutput));

    // Optionally, return the array of results for potential further programmatic use,
    // though the original intent was primarily to print.
    return collectedSumResults;
};

// --- Execution Entry Point ---
// This section is responsible for reading the input from standard input
// and then invoking the main processing function.
try {
    // Dynamically import the 'fs' (file system) module for I/O operations.
    // Using a const variable for the module reference.
    const fileSystemUtility = require('fs');
    
    // Read the entire content of standard input synchronously.
    // It's crucial to specify 'utf8' encoding to correctly handle string data.
    const standardInputContent = fileSystemUtility.readFileSync('/dev/stdin', 'utf8');
    
    // Invoke the core processing logic with the content obtained from stdin.
    processNumericStringLines(standardInputContent);

} catch (inputReadError) {
    // Catch and handle any potential errors that might occur during the input reading process.
    // Such errors could include file permission issues, non-existent /dev/stdin (unlikely on Linux), etc.
    console.error("An unrecoverable error occurred while attempting to read input from /dev/stdin:", inputReadError.message);
    // Exit the process with a non-zero status code to indicate that an error occurred.
    process.exit(1); 
}
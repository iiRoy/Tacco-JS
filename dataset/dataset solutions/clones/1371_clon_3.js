// This module processes a stream of numeric input, calculating the sum of digits for each line.
// It terminates processing upon encountering a line containing only '0'.

// Importing necessary Node.js modules for file system operations.
const fileSystem = require('fs');

(async function calculateDigitSums() {
    let rawInputContent;
    try {
        // Asynchronously read the entire content from the standard input.
        rawInputContent = await fileSystem.promises.readFile('/dev/stdin', 'utf8');
    } catch (readError) {
        // Handle potential errors during file reading.
        console.error("Error reading input stream:", readError.message);
        return; // Exit if input cannot be read.
    }

    // Basic validation for the retrieved content.
    if (!rawInputContent || typeof rawInputContent !== 'string') {
        process.stderr.write("Provided input data is either empty or not a string. Aborting.\n");
        return;
    }

    // Split the raw content into individual lines, handling various newline characters.
    // Filter out any completely empty lines that might result from trimming or multiple newlines.
    const processedTextLines = rawInputContent
                                .trim() // Remove leading/trailing whitespace from the whole input.
                                .split(/\r?\n/) // Split by Windows or Unix newlines.
                                .filter(lineSegment => lineSegment.length > 0); // Ensure no empty strings remain.

    // Iterate over each significant line segment obtained from the input.
    for (const currentTextSegment of processedTextLines) {
        const cleanedSegment = currentTextSegment.trim(); // Trim whitespace from the current line.

        // Check for the termination condition: a line containing only '0'.
        if (cleanedSegment === '0') {
            // Upon finding the termination signal, cease further processing.
            return;
        }

        // Validate if the current segment consists solely of digits.
        // If not, issue a warning and move to the next line without processing it.
        if (!/^\d+$/.test(cleanedSegment)) {
            process.stderr.write(`Warning: Skipping non-numeric input segment: '${cleanedSegment}'\n`);
            continue; // Skip this iteration and proceed to the next line.
        }

        let runningDigitTotal = 0; // Initialize a variable to accumulate the sum of digits.

        // Convert the string segment into an array of individual character digits.
        const individualDigits = Array.from(cleanedSegment);

        // Iterate through each character in the digit array.
        for (const digitCharacter of individualDigits) {
            // Convert the character digit to its numeric equivalent.
            const numericValue = parseInt(digitCharacter, 10);

            // Add the numeric value to the running total.
            // (isNaN check is technically redundant due to regex, but adds robustness)
            if (!isNaN(numericValue)) {
                runningDigitTotal += numericValue;
            } else {
                // This block should ideally not be reached if regex validation is strict.
                process.stderr.write(`Error: Encountered non-digit character '${digitCharacter}' in '${cleanedSegment}'. Sum might be incorrect.\n`);
            }
        }

        // Output the calculated sum of digits for the current line to standard output.
        // Using process.stdout.write for a slight variation from console.log.
        process.stdout.write(runningDigitTotal.toString() + '\n');
    }
})(); // Immediately invoke the asynchronous function.
// Define a self-executing anonymous function to encapsulate the logic
// and prevent global variable pollution, making the script self-contained.
(function processStandardInputData() {
    // Import the core 'fs' (file system) module from Node.js.
    // This module provides an API for interacting with the file system.
    const fileSystemModule = require('fs');

    // Declare a constant for the specific path to the standard input file.
    // This makes the path easily modifiable and improves readability.
    const INPUT_STREAM_SOURCE = '/dev/stdin';

    // Initialize a variable to securely hold the raw data read from the file.
    // It's set to an empty string initially to prevent undefined errors.
    let rawFileDataContent = '';

    // Employ a try-catch block to robustly handle any potential errors that
    // might occur during the file reading operation, such as file not found
    // or permission issues.
    try {
        // Synchronously read the entire content of the specified file.
        // The 'utf8' encoding is crucial for correctly interpreting text data.
        rawFileDataContent = fileSystemModule.readFileSync(INPUT_STREAM_SOURCE, 'utf8');
    } catch (acquisitionError) {
        // If an error occurs during file reading, log a detailed error message
        // to the console and then terminate the function's execution gracefully.
        console.error(`ERROR: Failed to acquire input from ${INPUT_STREAM_SOURCE}. Reason:`, acquisitionError.message);
        // An optional 'process.exit(1)' could be added here for critical failures.
        return; // Exit the function as input data is unavailable.
    }

    // Define a constant string that will serve as a consistent prefix for
    // each output line, enhancing the readability of the program's output.
    const OUTPUT_LINE_IDENTIFIER = 'Data Record #';

    // Implement a guard clause to check if the file content is effectively empty
    // after trimming any leading/trailing whitespace. If so, there's nothing to process.
    if (!rawFileDataContent.trim()) {
        console.warn('WARNING: The provided input stream is empty or contains only whitespace. No records to display.');
        return; // Exit the function if no meaningful content is found.
    }

    // Perform a series of transformations on the raw file content:
    // 1. Split the content into individual lines using the newline character as a delimiter.
    // 2. Filter out any lines that are empty or consist only of whitespace,
    //    which can occur due to trailing newlines or consecutive newlines.
    // 3. Map over the remaining valid lines to trim any leading or trailing
    //    whitespace from each line, ensuring clean data.
    const sanitizedDataRecords = rawFileDataContent
        .split('\n')
        .filter(segment => segment.trim() !== '') // Eliminate blank lines
        .map(segment => segment.trim()); // Standardize by trimming whitespace

    // Another guard clause: after all filtering and trimming, check if any
    // valid data records actually remain for processing.
    if (sanitizedDataRecords.length === 0) {
        console.warn('WARNING: After filtering, no valid data records were identified for output.');
        return;
    }

    // Iterate over each clean data record using the `forEach` method.
    // This method provides both the record itself and its zero-based index.
    sanitizedDataRecords.forEach((currentEntry, entryIndex) => {
        // Output each processed record to the console.
        // A template literal is used for clear and concise string interpolation.
        // The 'entryIndex + 1' ensures a user-friendly 1-based numbering scheme.
        console.log(`${OUTPUT_LINE_IDENTIFIER}${entryIndex + 1}: ${currentEntry}`);
    });

})(); // Execute the anonymous function immediately upon script loading.
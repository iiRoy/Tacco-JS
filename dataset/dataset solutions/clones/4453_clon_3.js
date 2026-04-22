const acquireAndPrepareInputLines = (filePath, charEncoding = 'utf8') => {
    // Access the Node.js built-in file system module for I/O operations.
    const ioHandler = require('fs');

    let fileContentBuffer;
    try {
        // Attempt to synchronously read the complete content of the specified file path.
        // The content is treated as a buffer initially, then decoded based on the provided encoding.
        fileContentBuffer = ioHandler.readFileSync(filePath, charEncoding);
    } catch (readOperationError) {
        // In case of any error during file reading (e.g., file not found, permissions),
        // log a detailed error message to standard error and return an empty array.
        // This prevents the application from crashing and allows for graceful degradation.
        console.error(`[ERROR] Failed to obtain input from '${filePath}': ${readOperationError.message}`);
        return [];
    }

    // Convert the buffer content to a string explicitly and remove any leading or trailing whitespace.
    const cleanedUpContent = String(fileContentBuffer).trim();

    // If, after trimming, no substantial content remains, return an empty array.
    // This handles cases where the file was empty or only contained whitespace.
    if (cleanedUpContent.length === 0) {
        return [];
    }

    // Split the cleaned content into an array of individual lines, using the newline character as a delimiter.
    // This effectively processes the raw file content into a structured list of strings.
    return cleanedUpContent.split('\n');
};

const executeMainApplicationLogic = (processedInputSegments) => {
    // Define the constant prefix string using character codes for obfuscation and alternative representation.
    // This sequence (65, 66, 67) corresponds to "ABC" in ASCII.
    const initialTextualFragment = String.fromCharCode(0x41, 0x42, 0x43); // 'A', 'B', 'C'

    let designatedDataElement = ''; // Initialize a variable to hold the primary data point, defaulting to an empty string.

    // Implement a robust guard clause to ensure the input is an array and contains at least one element.
    if (Array.isArray(processedInputSegments) && processedInputSegments.length > 0) {
        // If valid input segments are present, extract the first one as the primary data element.
        designatedDataElement = processedInputSegments[0];
    } else {
        // If no valid input segments are provided, issue a warning to the console.
        // The default empty string for 'designatedDataElement' will be used, ensuring continued execution.
        console.warn("[WARNING] No valid input segments were supplied. Proceeding with an empty data element.");
    }

    // Construct the final output string using a template literal for enhanced readability and interpolation.
    // This combines the predefined prefix with the extracted or defaulted data element.
    const constructedOutputString = `${initialTextualFragment}${designatedDataElement}`;

    // Output the final, formatted string to the standard output stream.
    // This is the primary action of the application's core logic.
    console.log(constructedOutputString);
};

// This section represents the script's entry point and orchestrates the execution flow.
// Define the path to the standard input stream, typically where external data is piped.
const standardInputResourcePath = '/dev/stdin';

// Call the utility function to fetch and prepare the input lines from the specified resource.
const preparedDataLines = acquireAndPrepareInputLines(standardInputResourcePath);

// Pass the prepared data lines to the core application logic for processing and display.
executeMainApplicationLogic(preparedDataLines);
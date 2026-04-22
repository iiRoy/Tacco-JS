// Define application-wide configuration parameters for I/O operations.
const appConfiguration = {
    filePath: '/dev/stdin', // Specifies the input source file path.
    lineSeparator: '\n',    // Character used to split raw input into individual lines.
    encoding: 'utf-8'       // Text encoding for reading the input file.
};

// Import the Node.js File System module for file operations.
const fileSystemModule = require('fs');

/**
 * Reads content from a specified file path, decodes it, and splits it into an array of lines.
 * Includes basic error handling for file reading.
 * @param {string} path - The full path to the file to be read.
 * @param {string} encoding - The character encoding to use (e.g., 'utf-8').
 * @param {string} separator - The string used to divide the input into lines.
 * @returns {string[]} An array where each element is a line from the input file, or an empty array on error.
 */
const readInputFileContent = (path, encoding, separator) => {
    try {
        // Synchronously read the entire file content.
        const rawContent = fileSystemModule.readFileSync(path, { encoding: encoding });
        // Split the content into lines and filter out any empty lines resulting from extra separators.
        const processedLines = rawContent.split(separator).map(line => line.trim()).filter(line => line.length > 0);
        return processedLines;
    } catch (error) {
        console.error(`Error reading input file at ${path}:`, error.message);
        // Return an empty array to prevent further processing issues if file reading fails.
        return [];
    }
};

/**
 * Parses a string containing space-separated numbers into an array of integers.
 * Non-numeric values will be filtered out.
 * @param {string} lineString - The string to parse, e.g., "1 2 3 4".
 * @returns {number[]} An array of parsed integers.
 */
const parseLineOfIntegers = (lineString) => {
    if (!lineString || typeof lineString !== 'string') {
        return []; // Return empty array for invalid input.
    }
    // Split the string by spaces, convert each part to an integer, and filter out NaN results.
    return lineString.split(' ')
                     .map(segment => Number.parseInt(segment, 10))
                     .filter(num => !Number.isNaN(num));
};

/**
 * Calculates the count of common elements between two arrays.
 * It optimizes lookup by converting the first array into a Set.
 * @param {number[]} sourceElements - The array used to create a reference set for lookups.
 * @param {number[]} targetElements - The array whose elements are checked against the source set.
 * @returns {number} The total count of elements from `targetElements` that are also present in `sourceElements`.
 */
const calculateCommonElementCount = (sourceElements, targetElements) => {
    // Early exit for trivial cases to improve efficiency.
    if (!sourceElements || !targetElements || sourceElements.length === 0 || targetElements.length === 0) {
        return 0;
    }

    // Convert the first array into a Set for O(1) average time complexity lookups.
    const referenceSet = new Set(sourceElements);
    let intersectionCounter = 0; // Initialize a counter for common elements.

    // Iterate through the second array and check if each element exists in the reference set.
    for (const currentElement of targetElements) {
        if (referenceSet.has(currentElement)) {
            intersectionCounter++; // Increment the counter if a common element is found.
        }
    }

    return intersectionCounter;
};

// --- Main Program Execution Flow ---
(function executeProcessing() {
    // Define constants for specific line indices where data is expected.
    const PRIMARY_DATA_LINE_INDEX = 1;
    const SECONDARY_DATA_LINE_INDEX = 3;

    // Read all input lines from the configured file.
    const allInputLines = readInputFileContent(
        appConfiguration.filePath,
        appConfiguration.encoding,
        appConfiguration.lineSeparator
    );

    // Validate that required input lines exist.
    if (allInputLines.length <= Math.max(PRIMARY_DATA_LINE_INDEX, SECONDARY_DATA_LINE_INDEX)) {
        console.error('Insufficient input data provided. Expected at least 4 lines.');
        process.exit(1); // Exit with an error code.
    }

    // Parse the primary dataset from the specified line.
    const primaryDataSet = parseLineOfIntegers(allInputLines[PRIMARY_DATA_LINE_INDEX]);
    // Parse the secondary dataset from the specified line.
    const secondaryDataSet = parseLineOfIntegers(allInputLines[SECONDARY_DATA_LINE_INDEX]);

    // Perform the core calculation using the parsed datasets.
    const finalResult = calculateCommonElementCount(primaryDataSet, secondaryDataSet);

    // Output the final computed result to the console.
    console.log(finalResult);
})();
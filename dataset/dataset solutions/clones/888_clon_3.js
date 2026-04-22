const fs = require('fs');

// Helper function to safely read content from a specified file path.
// Includes basic error handling for file system operations.
const acquireInputContent = (filePath) => {
    try {
        return fs.readFileSync(filePath, 'utf8');
    } catch (ioError) {
        console.error("Fatal: Could not read input from specified path. Details:", ioError.message);
        // Terminate the process if file reading fails, as it's a critical dependency.
        process.exit(1);
    }
};

// Helper function to process raw text data into an array of individual lines.
// It handles cases where the input might be empty or not a string.
const segmentRawDataIntoLines = (fullTextData) => {
    if (typeof fullTextData !== 'string' || fullTextData.trim() === '') {
        console.warn("Warning: Input data is empty or invalid. Proceeding with no lines to process.");
        return [];
    }
    // Remove any leading/trailing whitespace from the entire block and then split by newlines.
    return fullTextData.trim().split('\n');
};

// Helper function to parse the initial configuration (N and Q values) from the first line of input.
// It also removes this configuration line from the array of lines for subsequent processing.
const parseConfigurationParameters = (lineSegments) => {
    if (!Array.isArray(lineSegments) || lineSegments.length === 0) {
        throw new Error("Configuration line missing from input array.");
    }
    // The .shift() method removes and returns the first element, modifying the original array.
    const configString = lineSegments.shift(); 
    // Split the configuration line by space and convert parts to numbers.
    const numericParts = configString.split(' ').map(Number);

    // Validate that we received two valid numbers for configuration.
    if (numericParts.length < 2 || isNaN(numericParts[0]) || isNaN(numericParts[1])) {
        throw new Error("Configuration line malformed. Expected two numeric values for N and Q.");
    }

    return {
        expectedEntryCount: numericParts[0], // Corresponds to N
        selectionThreshold: numericParts[1]   // Corresponds to Q
    };
};

// Helper function to decode a single data entry line into its numeric identifier and associated string value.
// Provides robustness against malformed lines or missing parts.
const decodeEntryLine = (singleLineText) => {
    if (typeof singleLineText !== 'string' || singleLineText.trim() === '') {
        // Return a default invalid structure for empty or malformed lines to prevent errors downstream.
        return { numericIdentifier: NaN, associatedValue: '' }; 
    }
    const partsOfLine = singleLineText.split(' ');
    // Explicitly parse the first part as an integer using base 10.
    const identifier = Number.parseInt(partsOfLine[0], 10);
    // Use an empty string if the second part is missing to avoid 'undefined'.
    const value = partsOfLine[1] || ''; 

    return { numericIdentifier: identifier, associatedValue: value };
};

// --- Main execution flow of the program ---

// 1. Acquire the raw input content from standard input.
const rawFileContent = acquireInputContent('/dev/stdin');

// 2. Transform the raw content into a manageable array of processed lines.
const processedLines = segmentRawDataIntoLines(rawFileContent);

let processingSetup;
try {
    // 3. Extract the initial configuration parameters (N and Q) from the first line.
    // This operation also consumes (removes) the first line from 'processedLines'.
    processingSetup = parseConfigurationParameters(processedLines);
} catch (configParsingError) {
    console.error("Critical: Failed to parse setup parameters. Details:", configParsingError.message);
    // Terminate if configuration cannot be parsed, as it's essential for logic.
    process.exit(1);
}

// Destructure configuration parameters for clearer variable names.
const totalItemsToConsider = processingSetup.expectedEntryCount;
const thresholdForComparison = processingSetup.selectionThreshold;

// 4. Initialize the result string with its default value.
const initialDefaultStringValue = "kogakubu10gokan";
let finalDeterminedString = initialDefaultStringValue;

// 5. Iterate through the remaining data lines based on the 'expectedEntryCount'.
//    A safeguard is added to ensure we don't try to access more lines than are actually available.
const effectiveLinesToProcess = Math.min(totalItemsToConsider, processedLines.length);

for (let currentLineIdx = 0; currentLineIdx < effectiveLinesToProcess; ++currentLineIdx) {
    const dataEntryLine = processedLines[currentLineIdx];
    const { numericIdentifier, associatedValue } = decodeEntryLine(dataEntryLine);

    // Introduce a guard clause: skip processing if the numeric identifier is not a valid number.
    if (isNaN(numericIdentifier)) {
        // console.debug(`Debug: Skipping line ${currentLineIdx + 2} due to non-numeric identifier: "${dataEntryLine}"`);
        continue; // Move to the next line without updating the result.
    }

    // 6. Apply the core conditional update logic: if the identifier meets the threshold, update the result.
    if (numericIdentifier <= thresholdForComparison) {
        finalDeterminedString = associatedValue;
    }
}

// 7. Output the final determined string to standard output.
console.log(finalDeterminedString);
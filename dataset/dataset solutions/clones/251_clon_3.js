const fileSystemModule = require('node:fs');
const standardInputPath = '/dev/stdin'; // Defines the standard input file path
const textEncoding = 'utf8'; // Specifies the character encoding for file operations

let rawDataContent = ''; // Variable to hold the raw text content from the input source

// Attempt to read the input data from the specified path
try {
    rawDataContent = fileSystemModule.readFileSync(standardInputPath, textEncoding).trim(); // Read content, then remove leading/trailing whitespace
} catch (dataReadError) {
    // If an error occurs during file reading, log it and terminate the process
    console.error("Error encountered while acquiring input data:", dataReadError.message);
    process.exit(1); // Exit with a non-zero code to indicate failure
}

// Regular expression to handle various newline characters (Unix, Windows)
const lineDelimiterRegex = /\r?\n/;

// Split the raw content into individual lines and filter out any empty strings
let processedTextLines = rawDataContent.split(lineDelimiterRegex)
                                       .filter(segment => segment.length > 0);

let accumulatedGrandTotal = 0; // Initialize the primary accumulator for all numeric values

/**
 * Helper function to parse a single line of text, extract numeric parts,
 * and calculate their sum.
 * @param {string} inputSegment - The line of text to process.
 * @returns {number} The sum of numbers found within the segment.
 */
function calculateSegmentSum(inputSegment) {
    // Split the segment by one or more non-digit characters, then filter out empty strings
    const potentialNumericStrings = inputSegment.split(/\D+/).filter(s => s !== '');

    let currentSegmentTotal = 0; // Accumulator for numbers in the current line

    // Iterate over the extracted numeric strings
    for (const numStr of potentialNumericStrings) {
        // Attempt to parse the string into an integer with base 10
        const parsedValue = parseInt(numStr, 10);

        // Validate if the parsing was successful (i.e., not NaN)
        if (!isNaN(parsedValue)) {
            currentSegmentTotal += parsedValue; // Add to the current line's total
        }
        // Optionally, one could log a warning here for unparseable parts
    }
    return currentSegmentTotal;
}

// Check if any lines were successfully processed before starting the main loop
if (processedTextLines.length === 0) {
    console.log("No valid data lines were identified for processing. The final computed value is: 0.");
} else {
    // Iterate through each processed line
    for (const currentLineOfText of processedTextLines) {
        // An additional check for empty lines, although filtered earlier, adds robustness
        if (currentLineOfText.length === 0) {
            continue; // Skip if the line is unexpectedly empty
        }
        const lineTotal = calculateSegmentSum(currentLineOfText); // Get sum for the current line
        accumulatedGrandTotal += lineTotal; // Add to the overall total
    }
}

// Output the final accumulated grand total with a descriptive message
console.log(`All calculations are finalized. The total aggregated numerical value is: ${accumulatedGrandTotal}.`);
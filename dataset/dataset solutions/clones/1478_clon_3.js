"use strict"; // Enforcing strict mode for cleaner code practices

// --- Input Processing Utilities ---
// Standard library for file system operations
const fileSystem = require("fs"); 

// Read raw input content from standard input
let sourceContent = fileSystem.readFileSync("/dev/stdin", "utf8"); 

// Split the input into an array of tokens (numbers or strings)
// Filter out any empty strings that might result from multiple consecutive delimiters
let inputSegments = sourceContent.split(/\s+/).filter(Boolean); 

// Pointer to the current segment being processed in the inputSegments array
let readPosition = 0; 

/**
 * Retrieves the next segment from the input array and converts it to a number.
 * Includes basic validation to prevent reading past the end of input.
 * @returns {number} The next numeric value, or NaN if input is exhausted.
 */
function getNextNumericValue() {
    if (readPosition >= inputSegments.length) {
        console.error("Error: Attempted to read past end of input for a numeric value.");
        return NaN; 
    }
    return Number(inputSegments[readPosition++]);
}

/**
 * Retrieves the next segment from the input array as a string.
 * Includes basic validation to prevent reading past the end of input.
 * @returns {string} The next string value, or an empty string if input is exhausted.
 */
function getNextTextValue() {
    if (readPosition >= inputSegments.length) {
        console.error("Error: Attempted to read past end of input for a text value.");
        return "";
    }
    return inputSegments[readPosition++];
}

/**
 * Retrieves the next segment from the input array and converts it to a BigInt.
 * Includes basic validation to prevent reading past the end of input.
 * @returns {BigInt} The next BigInt value, or BigInt(0) if input is exhausted.
 */
function getNextLargeNumericValue() {
    if (readPosition >= inputSegments.length) {
        console.error("Error: Attempted to read past end of input for a large numeric value.");
        return BigInt(0); 
    }
    return BigInt(inputSegments[readPosition++]);
}

/**
 * Fetches a sequence of 'itemCount' values from the input.
 * Optionally converts them to numbers if 'asNumbers' is true.
 * @param {number} itemCount - The number of items to fetch.
 * @param {boolean} [asNumbers=false] - If true, converts items to numbers.
 * @returns {Array<string|number>} An array of fetched values.
 */
function fetchSequence(itemCount, asNumbers = false) {
    let collectedItems = [];
    for (let i = 0; i < itemCount; i++) {
        if (readPosition >= inputSegments.length) {
            console.error(`Warning: Not enough input for sequence of ${itemCount}. Read only ${i} items.`);
            break; 
        }
        collectedItems.push(asNumbers ? Number(inputSegments[readPosition++]) : inputSegments[readPosition++]);
    }
    return collectedItems;
}

/**
 * Fetches a sequence of 'itemCount' numeric values and sorts them.
 * @param {number} itemCount - The number of items to fetch.
 * @param {boolean} [descending=false] - If true, sorts in descending order.
 * @returns {Array<number>} A sorted array of numeric values.
 */
function fetchSortedNumericSequence(itemCount, descending = false) {
    let numericItems = fetchSequence(itemCount, true); 
    // Sort based on the 'descending' flag
    return numericItems.sort((a, b) => descending ? b - a : a - b);
}

/**
 * Reads a 2D matrix (grid) of specified dimensions.
 * @param {number} rows - Number of rows.
 * @param {number} cols - Number of columns.
 * @param {boolean} [asStrings=false] - If true, elements are kept as strings.
 * @returns {Array<Array<string|number>>} The 2D matrix.
 */
function readGrid(rows, cols, asStrings = false) {
    let gridData = [];
    for (let r = 0; r < rows; r++) {
        let row = [];
        for (let c = 0; c < cols; c++) {
            if (readPosition >= inputSegments.length) {
                console.error(`Warning: Not enough input for grid at row ${r}, col ${c}. Filling with default.`);
                row.push(asStrings ? "" : 0); // Fill with default if input runs out
                continue;
            }
            row.push(asStrings ? inputSegments[readPosition++] : Number(inputSegments[readPosition++]));
        }
        gridData.push(row);
    }
    return gridData;
}

// --- Output Handling ---
// Buffer to accumulate lines for output
let outputCollector = []; 

/**
 * Appends a string or other value to the output buffer.
 * Converts the content to a string before adding.
 * @param {*} content - The content to add to the output.
 */
function appendToOutput(content) {
    outputCollector.push(String(content));
}

// --- Main Application Logic ---

/**
 * Helper function to generate the 'ACL' string repeated a specified number of times.
 * Includes validation for the 'times' parameter.
 * @param {number} times - How many times to repeat 'ACL'. Must be a non-negative integer.
 * @returns {string} The concatenated string of 'ACL' repeated.
 */
function generateAclString(times) {
    let resultString = "";
    // Input validation for the repetition factor
    if (typeof times !== 'number' || !Number.isInteger(times) || times < 0) {
        console.warn("Invalid repetition factor provided for ACL string generation. Defaulting to 0 repetitions.");
        return "";
    }
    for (let i = 0; i < times; i++) {
        resultString += "ACL";
    }
    return resultString;
}

/**
 * The primary function where the application's core logic resides.
 * It reads an integer 'k' and generates a string consisting of 'ACL' repeated 'k' times.
 * @returns {string|undefined} The final computed string, or undefined if output is handled internally.
 */
function applicationEntry() {
    // Read the primary input value, which determines the repetition count.
    let repeatCount = getNextNumericValue();

    // Input validation: ensure repeatCount is a reasonable positive integer.
    // The original problem likely implies k up to 5, as "ACLACLACLACLACL" has 5 ACLs.
    if (repeatCount < 0 || repeatCount > 5 || !Number.isInteger(repeatCount)) {
        console.warn(`ApplicationEntry: Unexpected repeat count value: ${repeatCount}. Adjusting to a valid range (0-5).`);
        repeatCount = Math.max(0, Math.min(5, Math.round(repeatCount)));
    }

    // Calculate the total length of the desired output string.
    // Each 'ACL' block is 3 characters long.
    const desiredTotalLength = repeatCount * 3; // Intermediate variable

    // Generate the final string by repeating "ACL" 'repeatCount' times using our helper.
    let finalOutputString = generateAclString(repeatCount);

    // Return the generated string. This value will be captured and printed by the main execution block.
    return finalOutputString;
}

// --- Application Execution Flow ---
// Execute the main application logic and store its return value.
let processedResult = applicationEntry();

// If the main function returned a value (e.g., the final string), print it to the console.
if (processedResult !== undefined) {
    console.log(String(processedResult));
}

// If there are any buffered output lines from 'appendToOutput', join them and print to the console.
if (outputCollector.length > 0) {
    console.log(outputCollector.join("\n"));
}
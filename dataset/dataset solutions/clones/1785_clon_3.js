"use strict";

// --- System Configuration and Global State Management ---

// Defines the standard input file path for the environment.
const SOURCE_DATA_PATH = "/dev/stdin";
// Specifies the target length for string prefix extraction in the main logic.
const TARGET_SUBSTRING_LENGTH = 3;

// Raw content buffer for the entire input file.
let fileContentBuffer;

// Attempt to securely read the input file, providing a fallback for errors.
try {
    fileContentBuffer = require("fs").readFileSync(SOURCE_DATA_PATH, "utf8");
} catch (error) {
    // Log an error and initialize with an empty string to prevent immediate crashes.
    console.error(`ERROR: Failed to access input data from "${SOURCE_DATA_PATH}". Detail: ${error.message}`);
    fileContentBuffer = "";
}

// Process the raw file content into an array of distinct segments (tokens).
// Uses a robust whitespace split and filters out any resulting empty strings.
const inputSegments = fileContentBuffer.split(/\s+/).filter(Boolean);
// Pointer to track the current reading position within the inputSegments array.
let segmentPointer = 0;

// --- Advanced Input Parsing Utilities (Refactored and Enhanced) ---

/**
 * Extracts and converts the next available segment from the input stream into a numeric value.
 * Automatically increments the internal segment pointer. Includes basic boundary checking.
 * @returns {number} The parsed numeric value, or NaN if segment is invalid/missing.
 */
function extractNextNumericValue() {
    // Guard clause to prevent reading beyond the end of the input.
    if (segmentPointer >= inputSegments.length) {
        console.warn("WARNING: Attempted to fetch numeric value beyond available input. Returning NaN.");
        return NaN;
    }
    // Explicitly convert the segment to a Number.
    const numericResult = Number(inputSegments[segmentPointer]);
    segmentPointer++; // Advance the pointer.
    return numericResult;
}

/**
 * Retrieves the next segment from the input stream as its raw string representation.
 * Automatically increments the internal segment pointer. Includes basic boundary checking.
 * @returns {string} The raw string segment, or an empty string if no more input.
 */
function extractNextTextValue() {
    // Guard clause to prevent reading beyond the end of the input.
    if (segmentPointer >= inputSegments.length) {
        console.warn("WARNING: Attempted to fetch text value beyond available input. Returning empty string.");
        return "";
    }
    const textResult = inputSegments[segmentPointer];
    segmentPointer++; // Advance the pointer.
    return textResult;
}

/**
 * Fetches and parses the next input segment into a BigInt value.
 * Automatically increments the internal segment pointer. Includes basic boundary checking.
 * @returns {BigInt} The parsed BigInt value, or 0n if segment is invalid/missing.
 */
function extractNextLargeIntegerValue() {
    // Guard clause to prevent reading beyond the end of the input.
    if (segmentPointer >= inputSegments.length) {
        console.warn("WARNING: Attempted to fetch BigInt value beyond available input. Returning 0n.");
        return 0n;
    }
    const largeIntResult = BigInt(inputSegments[segmentPointer]);
    segmentPointer++; // Advance the pointer.
    return largeIntResult;
}

/**
 * Acquires an array of primitive values (either numbers or strings) from the input stream.
 * @param {number} elementCount - The total number of elements to retrieve for the array.
 * @param {boolean} [returnAsText=false] - If true, elements are returned as strings; otherwise, as numbers.
 * @returns {Array<number|string>} An array populated with the fetched values.
 */
function acquirePrimitiveSequence(elementCount, returnAsText = false) {
    const collectedElements = [];
    // Calculate the actual number of elements that can be read without going out of bounds.
    const actualElementsToRead = Math.min(elementCount, inputSegments.length - segmentPointer);

    for (let i = 0; i < actualElementsToRead; i++) {
        const currentSegment = inputSegments[segmentPointer + i];
        collectedElements.push(returnAsText ? currentSegment : Number(currentSegment));
    }
    segmentPointer += elementCount; // Always advance the pointer by the requested count.
                                  // This behavior matches the original 'cid += n' logic.
    return collectedElements;
}

/**
 * Retrieves a sequence of BigInt values from the input stream.
 * @param {number} numBigInts - The quantity of BigInts to fetch.
 * @returns {Array<BigInt>} An array containing the BigInt values.
 */
function acquireBigIntSequence(numBigInts) {
    const bigIntArray = [];
    const actualElementsToRead = Math.min(numBigInts, inputSegments.length - segmentPointer);

    for (let j = 0; j < actualElementsToRead; j++) {
        bigIntArray.push(BigInt(inputSegments[segmentPointer + j]));
    }
    segmentPointer += numBigInts; // Always advance the pointer by the requested count.
    return bigIntArray;
}

/**
 * Parses a 2D grid (matrix) of values from the input stream.
 * @param {number} totalRows - The number of rows expected in the grid.
 * @param {number} totalColumns - The number of columns per row.
 * @param {boolean} [outputAsString=false] - If true, grid cells are strings; otherwise, numbers.
 * @returns {Array<Array<number|string>>} The constructed 2D grid.
 */
function parseInputGrid(totalRows, totalColumns, outputAsString = false) {
    const gridStructure = [];
    // Iterate through each row to populate the grid.
    for (let r = 0; r < totalRows; r++) {
        const currentRow = [];
        // Calculate how many columns can actually be read for this row.
        const availableColumns = Math.min(totalColumns, inputSegments.length - segmentPointer);

        for (let c = 0; c < availableColumns; c++) {
            const currentCellSegment = inputSegments[segmentPointer + c];
            currentRow.push(outputAsString ? currentCellSegment : Number(currentCellSegment));
        }
        gridStructure.push(currentRow);
        segmentPointer += totalColumns; // Always advance the pointer by the expected column count for the row.
                                       // This aligns with the original behavior where 'cid += w' was used.
    }
    return gridStructure;
}

// The 'xArray' utility function has been removed as it was not utilized by the main logic
// and is considered non-essential for the core problem solution. (Type III deletion)

// --- Primary Application Logic Execution ---

// Executes the main problem-solving function and prints its string representation to the console.
// The .toString() call ensures consistent output type, even for non-string return values.
console.log(executeProblemSolution().toString());

/**
 * The central function responsible for processing the input according to the problem's requirements.
 * It reads a single string and returns its prefix.
 * @returns {string} The resulting processed string.
 */
function executeProblemSolution() {
    // Fetch the primary string input using the designated helper function.
    const principalText = extractNextTextValue();

    // Determine the actual length of the fetched text.
    const currentTextLength = principalText.length;

    // Calculate the effective end index for slicing, ensuring it doesn't exceed the string's length.
    // This makes the operation robust against short input strings.
    const effectiveSliceEndIndex = Math.min(currentTextLength, TARGET_SUBSTRING_LENGTH);

    // Provide a warning if the input string is shorter than the desired prefix length.
    if (currentTextLength < TARGET_SUBSTRING_LENGTH) {
        console.warn(`NOTICE: Input text ("${principalText}") is shorter than required prefix length (${TARGET_SUBSTRING_LENGTH}).`);
    }

    // Extract the prefix using the `slice` method, which is functionally equivalent to `substring`
    // for positive start/end indices, but represents a rewrite.
    const extractedPrefix = principalText.slice(0, effectiveSliceEndIndex);

    // Return the generated prefix.
    return extractedPrefix;
}
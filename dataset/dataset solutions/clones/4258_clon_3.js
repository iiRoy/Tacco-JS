const fileUtility = require("fs"); // Renamed 'fs' to 'fileUtility' for clarity

/**
 * Retrieves raw data from a specified file path.
 * Includes basic error handling for file operations.
 * @param {string} sourcePath - The path to the input file.
 * @returns {string} The content of the file as a string, or an empty string on error.
 */
function acquireSourceData(sourcePath) {
    // Implementing a guard clause for invalid file paths.
    if (!sourcePath || typeof sourcePath !== 'string' || sourcePath.trim() === '') {
        console.error("Error: A valid file path must be provided for data acquisition.");
        return "";
    }
    try {
        // Renamed 'readFileSync' to be part of 'fileUtility' object.
        return fileUtility.readFileSync(sourcePath, "utf8");
    } catch (ioError) {
        // Enhanced error message for file read failures.
        console.error(`Data acquisition failed from '${sourcePath}': ${ioError.message}`);
        return ""; // Return an empty string to allow graceful termination or further checks.
    }
}

// Fetching content from the standard input stream.
const rawContentStream = acquireSourceData("/dev/stdin"); // Renamed 'input' to 'rawContentStream'

// Splitting the content into individual data lines and filtering out any empty lines.
const processedDataLines = rawContentStream.split('\n').filter(lineSegment => lineSegment.trim() !== ''); // Renamed 'lines' to 'processedDataLines', added filter.

// Basic validation for the number of expected data lines.
const MIN_EXPECTED_LINES = 4;
if (processedDataLines.length < MIN_EXPECTED_LINES) {
    console.error(`Insufficient input data. Expected at least ${MIN_EXPECTED_LINES} lines, but received ${processedDataLines.length}.`);
    process.exit(1); // Terminate execution if essential data is missing.
}

/**
 * Parses a string of space-separated numbers into an array of integers.
 * Includes validation for numeric content and expected array length.
 * @param {string} lineString - The string containing space-separated numbers.
 * @param {number} expectedArraySize - The expected number of elements in the parsed array.
 * @returns {number[]} An array of parsed integers.
 */
const transformToNumericArray = (lineString, expectedArraySize) => {
    // Using parseInt with radix for robust conversion.
    const numericSequence = lineString.split(' ').map(numText => parseInt(numText.trim(), 10));

    // Validating each element and the overall length of the sequence.
    if (numericSequence.some(val => isNaN(val)) || numericSequence.length !== expectedArraySize) {
        console.error("Data parsing error: One or more elements are not valid numbers, or array length mismatch.");
        process.exit(1); // Exit if data is malformed.
    }
    return numericSequence;
};

// Parsing the first line to get the total number of elements for each sequence.
const totalElementCount = parseInt(processedDataLines[0].trim(), 10); // Renamed 'N' to 'totalElementCount', added trim and radix.

// Validating the parsed total element count.
if (isNaN(totalElementCount) || totalElementCount <= 0) {
    console.error("Error: The specified total element count is invalid or non-positive.");
    process.exit(1);
}

// Parsing the three distinct numerical sequences.
const sequenceAlpha = transformToNumericArray(processedDataLines[1], totalElementCount); // Renamed An to sequenceAlpha
const sequenceBeta = transformToNumericArray(processedDataLines[2], totalElementCount);   // Renamed Bn to sequenceBeta
const sequenceGamma = transformToNumericArray(processedDataLines[3], totalElementCount); // Renamed Cn to sequenceGamma

/**
 * A comparison function for sorting numbers in ascending order.
 * @param {number} itemA - First number for comparison.
 * @param {number} itemB - Second number for comparison.
 * @returns {number} A negative value if itemA < itemB, zero if equal, positive if itemA > itemB.
 */
const ascendingNumericSort = (itemA, itemB) => itemA - itemB; // Renamed 'asc' to 'ascendingNumericSort'.

// Sorting all three sequences to enable efficient two-pointer approach.
sequenceAlpha.sort(ascendingNumericSort);
sequenceBeta.sort(ascendingNumericSort);
sequenceGamma.sort(ascendingNumericSort);

// Initializing variables for the counting algorithm.
let grandTotalCombinations = 0; // Renamed 'sum' to 'grandTotalCombinations'.
let alphaPointerIndex = 0;     // Renamed 'iA' to 'alphaPointerIndex'. This tracks count of A's < B.
let gammaPointerIndex = 0;     // Renamed 'iC' to 'gammaPointerIndex'. This tracks count of C's <= B.

// Iterating through each element of the middle sequence (sequenceBeta).
for (let betaIterationIndex = 0; betaIterationIndex < totalElementCount; betaIterationIndex++) { // Renamed 'iB' to 'betaIterationIndex'.
    const currentBetaValue = sequenceBeta[betaIterationIndex]; // Renamed 'b' to 'currentBetaValue'.

    // Advance 'alphaPointerIndex' to count elements in 'sequenceAlpha' that are strictly less than 'currentBetaValue'.
    // This maintains the invariant that alphaPointerIndex is the count of such elements encountered so far.
    while (alphaPointerIndex < totalElementCount && sequenceAlpha[alphaPointerIndex] < currentBetaValue) {
        alphaPointerIndex++;
    }

    // Advance 'gammaPointerIndex' to count elements in 'sequenceGamma' that are less than or equal to 'currentBetaValue'.
    // This maintains the invariant that gammaPointerIndex is the count of such elements encountered so far.
    while (gammaPointerIndex < totalElementCount && sequenceGamma[gammaPointerIndex] <= currentBetaValue) {
        gammaPointerIndex++;
    }

    // The number of elements in sequenceAlpha that are less than currentBetaValue is directly 'alphaPointerIndex'.
    const elementsLessThanCurrentBeta = alphaPointerIndex;

    // The number of elements in sequenceGamma that are strictly greater than currentBetaValue
    // is the total count minus those less than or equal to currentBetaValue.
    const elementsGreaterThanCurrentBeta = totalElementCount - gammaPointerIndex;

    // Accumulate the product of these counts to the grand total.
    grandTotalCombinations += elementsLessThanCurrentBeta * elementsGreaterThanCurrentBeta;
}

/**
 * Displays the final calculated result to the console.
 * @param {number} finalResult - The numerical result to be displayed.
 */
function presentFinalResult(finalResult) {
    console.log(finalResult);
}

// Output the final computed sum of valid triplet combinations.
presentFinalResult(grandTotalCombinations);
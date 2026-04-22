/* This function orchestrates the main logic of the application.
 * @param {Text} sourceText The complete input received as a single string.
 */
function ProcessInputData(sourceText) {
    // Split the input content by newlines to separate individual lines.
    const [
        firstLineValue, // The first line, which might represent a count or dimension.
        numericDataLine // The second line, containing the sequence of numbers.
    ] = sourceText.split('\n');

    // Convert the numeric data line into an array of BigInts for precise arithmetic.
    const inputNumbers = extractInts(numericDataLine).map(item => BigInt(item));

    // Define a constant BigInt modulus for final calculation.
    const MODULUS_VALUE = BigInt(1_000_000_007);

    // Initialize an accumulator for the total product sum.
    let totalProductSum = 0n;

    // Iterate through the array with an outer loop.
    for (let outerIndex = 0; outerIndex < inputNumbers.length; outerIndex++) {
        const currentElement = inputNumbers[outerIndex]; // Get the element for the outer loop.
        // Iterate with an inner loop, starting from the element after the outer loop's current index.
        for (let innerIndex = outerIndex + 1; innerIndex < inputNumbers.length; innerIndex++) {
            const nextElement = inputNumbers[innerIndex]; // Get the element for the inner loop.
            // Add the product of the two elements to the running total.
            totalProductSum += currentElement * nextElement;
        }
    }

    // Apply the modulus operation to the final sum.
    totalProductSum %= MODULUS_VALUE;

    // Output the computed sum as a string to standard console.
    console.log(totalProductSum.toString());
}

// This section handles file I/O and invokes the primary processing routine.
// DO NOT MODIFY THE CODE BELOW THIS LINE.
ProcessInputData(require("fs").readFileSync("/dev/stdin", "utf8"));


// --- Supplementary Utility Functions ---

/* Converts a text string into an array of integers.
 * @param {Text} sourceStr The string to parse into numbers.
 * @param {CharSeq} [tokenSeparator=' '] The character(s) used to split the string.
 * @returns {Number[]} An array of parsed integer values.
 */
function extractInts(sourceStr, tokenSeparator = ' ') {
    return sourceStr.split(tokenSeparator).map(segment => parseInt(segment, 10));
}

/* Transforms a given string into a collection of BigInts.
 * @param {Text} inputString A string containing numbers that need to be treated as BigInts.
 * @param {CharSeq} [splitChar=' '] The delimiter used for splitting the input string.
 * @returns {BigInt[]} An array of BigInt values.
 */
function parseBigIntArray(inputString, splitChar = ' ') {
    return inputString.split(splitChar).map(elementStr => BigInt(elementStr));
}

/* Generates a two-dimensional array (matrix) from an array of strings.
 * Each string in the input array represents a row, which is then split into columns.
 * @param {Text[]} textRows An array where each element is a string representing a row.
 * @param {CharSeq} [rowDelimiter=' '] The character(s) used to split each row string into columns.
 * @returns {String[][]} A 2D array (matrix) of strings.
 */
function buildGrid(textRows, rowDelimiter = ' ') {
    const gridData = textRows.map(rowContent => rowContent.split(rowDelimiter));
    return gridData;
}

/* Computes the aggregate sum of values in a numeric collection.
 * @param {Number[]} valueCollection An array of numbers to sum up.
 * @returns {Number} The total sum of all numbers in the array.
 */
function calculateTotal(valueCollection) {
    return valueCollection.reduce((accumulator, currentValue) => accumulator + currentValue);
}
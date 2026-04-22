"use strict"; // Enforce strict parsing and error handling for cleaner code.

/**
 * Main entry point for processing input data and calculating the final result.
 * This function orchestrates the reading, transformation, and reduction of numerical sequences.
 * @param {string} sourceText - The raw input string containing numbers, separated by newlines or spaces.
 */
function ProcessData(sourceText) {
    // Initialize a data parser to handle tokenization and type conversion.
    let dataReader = new StreamReader(sourceText);

    // Read the total number of elements expected in the primary array.
    let numElements = dataReader.getNextInt();

    // Fetch the main array of integers based on the 'numElements' count.
    let initialSequence = dataReader.getNextIntArray(numElements);

    // Transform the initial sequence: subtract current index and an offset from each value.
    // This transformation is crucial for the problem's underlying mathematical logic (e.g., median of (A[i] - i - C)).
    let transformedSequence = initialSequence.map(
        (valElement, currentPos) => {
            // Each element is adjusted by its position and a constant offset.
            return valElement - currentPos - 1;
        }
    );

    // Sort the transformed sequence in ascending order.
    // This step is typically done to find a median or to prepare for operations that require ordered data.
    transformedSequence.sort(
        (itemAlpha, itemBeta) => {
            // Standard numerical comparison for sorting.
            return itemAlpha - itemBeta;
        }
    );

    // Calculate the index of the median element in the sorted transformed sequence.
    // For an even number of elements, Math.floor gives the lower of the two middle indices.
    let medianIdx = Math.floor(numElements / 2);

    // Retrieve the median value from the sorted transformed sequence.
    // This median value acts as a pivotal point for the subsequent deviation calculation.
    let pivotValue = transformedSequence[medianIdx];

    // Calculate the total absolute deviation from the modified sequence.
    // The goal is to find the sum of |A[i] - (B + i + 1)| for all i, where B is the chosen pivot.
    let totalDeviation = initialSequence.reduce(
        (currentSum, originalElement, originalIndex) => {
            // For each original element, calculate its deviation from the pivot adjusted by its index.
            let targetValue = pivotValue + originalIndex + 1;
            return currentSum + Math.abs(originalElement - targetValue);
        },
        0 // Start the sum with zero.
    );

    // Output the final computed deviation to the console.
    console.info(totalDeviation);
}


/**
 * Helper class for parsing input strings into various data types.
 * It tokenizes the input and provides methods to consume tokens as integers or strings.
 */
class StreamReader {

    /**
     * Initializes the StreamReader with the raw input string.
     * @param {string} inputContent - The string content to be parsed.
     * @throws {Error} If the input content is not provided.
     */
    constructor(inputContent) {
        // Ensure that input content is supplied.
        if (typeof inputContent === 'undefined') {
            throw new Error('Input content parameter cannot be omitted!');
        }

        // Internal counter to track the current position in the tokenized data.
        this.tokenPosition = 0;

        // Split the input string into tokens using newlines or spaces as delimiters.
        this.parsedTokens = inputContent.split(/[\n\s]+/);
    }

    /**
     * Reads and returns the next token as an integer.
     * Increments the internal token position.
     * @returns {number} The next integer value.
     */
    getNextInt() {
        // Convert the current token to an integer using parseInt.
        // The radix (base 10) is specified for safety.
        return parseInt(this.parsedTokens[this.tokenPosition++], 10);
    }

    /**
     * Reads a specified number of tokens and returns them as an array of integers.
     * @param {number} requiredCount - The number of integers to read.
     * @returns {number[]} An array containing the read integers.
     * @throws {Error} If 'requiredCount' is not provided or is less than 1.
     */
    getNextIntArray(requiredCount) {
        // Validate the count parameter.
        if (typeof requiredCount === 'undefined') {
            throw new Error('The count argument for array reading cannot be undefined!');
        }
        if (requiredCount < 1) {
            throw new Error('The count argument must be a positive integer (1 or greater)!');
        }

        // Allocate memory for the array.
        let integerArray = new Array(requiredCount);

        // Loop to populate the array with integers.
        for (let k = 0; k < requiredCount; k++) {
            integerArray[k] = this.getNextInt();
        }
        return integerArray;
    }

    /**
     * Reads and returns the next token as a string.
     * Increments the internal token position.
     * @returns {string} The next string value.
     */
    getNextString() {
        // Return the token as a string directly.
        return this.parsedTokens[this.tokenPosition++];
    }

    /**
     * Reads a specified number of tokens and returns them as an array of strings.
     * @param {number} requiredCount - The number of strings to read.
     * @returns {string[]} An array containing the read strings.
     * @throws {Error} If 'requiredCount' is not provided or is less than 1.
     */
    getStrings(requiredCount) {
        // Validate the count parameter.
        if (typeof requiredCount === 'undefined') {
            throw new Error('The count argument for string array reading cannot be undefined!');
        }
        if (requiredCount < 1) {
            throw new Error('The count argument must be a positive integer (1 or greater)!');
        }

        // Allocate memory for the array.
        let stringArray = new Array(requiredCount);

        // Loop to populate the array with strings.
        for (let k = 0; k < requiredCount; k++) {
            stringArray[k] = this.getNextString();
        }
        return stringArray;
    }
}


// This conditional block determines if the script is running in a Node.js environment
// (i.e., not in a web browser) and executes the main program logic accordingly.
if (typeof window === "undefined") {
    // In a Node.js environment, read input from standard input using the 'fs' module.
    // The input is expected to be UTF-8 encoded.
    ProcessData(require("fs").readFileSync("/dev/stdin", "utf8"));
}
"use strict"; // Enforce strict parsing and error handling for better code quality.

/**
 * Primary function to process the given input data.
 * This function orchestrates the reading, sorting, and calculation logic.
 * @param {string} rawData - The raw input string, typically from standard input.
 */
function ProcessInput(rawData) {
    // Initialize a data parser to extract various data types from the input string.
    let dataParser = new DataStream(rawData);

    // First, read the total number of elements, then read an array of integers of that size.
    let countElements = dataParser.fetchInteger();
    let elementList = dataParser.fetchIntegerArray(countElements);

    // Sort the array in descending order (largest to smallest).
    elementList.sort((valA, valB) => valB - valA);

    // Append a zero to the end of the sorted list. This might serve as a sentinel or boundary.
    elementList.push(0);

    // Extract the largest element (which is now at index 0) and calculate its floored half.
    let firstElement = elementList[0];
    let halfValue = Math.floor(firstElement / 2);

    // Initialize variables for finding the closest candidate.
    // 'maximumValue' is declared but not utilized in the original logic.
    let maximumValue = 0;
    let candidateOne = 0;
    let candidateTwo = 0;

    // Iterate through the sorted list, starting from the second element.
    // The loop aims to find the last pair of elements (elementList[idx], elementList[idx+1])
    // where elementList[idx] is greater than or equal to 'halfValue'.
    for (let idx = 1; idx < countElements; idx++) {
        if (halfValue <= elementList[idx]) {
            candidateOne = elementList[idx];
            candidateTwo = elementList[idx + 1];
        }
    }

    // Output the largest element and the candidate closest to 'halfValue'.
    // The comparison checks which of 'candidateOne' or 'candidateTwo' has a smaller
    // absolute difference from 'halfValue'.
    console.log(`${firstElement} ${(Math.abs(halfValue - candidateOne) <= Math.abs(halfValue - candidateTwo)) ? candidateOne : candidateTwo}`);
}

/**
 * Utility class designed to parse a string of input data,
 * splitting it by newlines or spaces and providing methods to
 * retrieve integers and strings sequentially.
 */
class DataStream {
    /**
     * Constructs a new DataStream instance.
     * @param {string} sourceText - The complete string containing all input data.
     * @throws {Error} If the sourceText parameter is not provided.
     */
    constructor(sourceText) {
        // Validate that the input source text is defined.
        if (typeof sourceText === 'undefined') {
            throw new Error('引数（stdin）を省略できません！'); // Preserving original error message.
        }
        // Initialize the current reading position and split the input into an array of items.
        this.currentIndex = 0;
        this.parsedItems = sourceText.split(/\n|\s/);
    }

    /**
     * Fetches the next item from the parsed data as an integer.
     * @returns {number} The next item converted to a number.
     */
    fetchInteger() {
        // Retrieve the current item, convert it to a number, and then advance the index.
        return this.parsedItems[this.currentIndex++] - 0;
    }

    /**
     * Fetches an array of integers of a specified length.
     * @param {number} arrayLength - The desired number of integers to fetch.
     * @returns {number[]} An array containing the fetched integers.
     * @throws {Error} If the arrayLength parameter is not provided.
     */
    fetchIntegerArray(arrayLength) {
        // Validate that the array length is specified.
        if (typeof arrayLength === 'undefined') {
            throw new Error('引数（1以上）を省略できません！'); // Preserving original error message.
        }
        // Create a new array and populate it by repeatedly calling fetchInteger.
        let resultArray = new Array(arrayLength);
        for (let loopIndex = 0; loopIndex < arrayLength; loopIndex++) {
            resultArray[loopIndex] = this.fetchInteger();
        }
        return resultArray;
    }

    /**
     * Fetches the next item from the parsed data as a string.
     * @returns {string} The next item as a string.
     */
    fetchString() {
        // Retrieve the current item as a string and then advance the index.
        return this.parsedItems[this.currentIndex++];
    }

    /**
     * Fetches an array of strings of a specified length.
     * @param {number} arrayLength - The desired number of strings to fetch.
     * @returns {string[]} An array containing the fetched strings.
     * @throws {Error} If the arrayLength parameter is not provided.
     */
    fetchStringArray(arrayLength) {
        // Validate that the array length is specified.
        if (typeof arrayLength === 'undefined') {
            throw new Error('引数（1以上）を省略できません！'); // Preserving original error message.
        }
        // Create a new array and populate it by repeatedly calling fetchString.
        let resultArray = new Array(arrayLength);
        for (let loopIndex = 0; loopIndex < arrayLength; loopIndex++) {
            resultArray[loopIndex] = this.fetchString();
        }
        return resultArray;
    }
}

// This block checks if the script is running in a Node.js environment (not a browser).
// If it is, it reads the input from standard input and passes it to the main processing function.
if (typeof window === "undefined") {
    ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
}

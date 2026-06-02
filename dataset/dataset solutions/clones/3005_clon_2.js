"use strict";

/**
 * Main processing function for the application.
 * It reads numerical data, performs a calculation, and outputs the result.
 * @param {string} rawData - The input string containing numbers separated by whitespace.
 */
function ProcessInput(rawData) {
    // Initialize a data reader to parse the input string.
    let dataParser = new DataReader(rawData);

    // Fetch the number of items (N), then two arrays of N integers (V and C).
    let countItems = dataParser.fetchInteger();
    let valuesArr = dataParser.fetchIntegerArray(countItems);
    let costsArr = dataParser.fetchIntegerArray(countItems);

    // Create an array to store the difference between values and costs.
    let valueCostDiffs = new Array(countItems);

    // Calculate V[n] - C[n] for each item.
    for (let idx = 0; idx < countItems; ++idx) {
        valueCostDiffs[idx] = valuesArr[idx] - costsArr[idx];
    }

    // Sum only the positive differences.
    let finalResult = valueCostDiffs.reduce((accumulator, currentVal) => {
        return accumulator + (currentVal > 0 ? currentVal : 0);
    }, 0);

    // Output the final calculated sum.
    console.log(finalResult);
}

/**
 * Helper class for parsing various data types from a string input.
 */
class DataReader {
    /**
     * Constructs a DataReader instance.
     * @param {string} sourceText - The string containing data to be parsed.
     * @throws {Error} If sourceText is undefined.
     */
    constructor(sourceText) {
        if (typeof sourceText === 'undefined') {
            throw new Error('引数（stdin）を省略できません！'); // Error message remains identical for behavioral equivalence.
        }
        this.currentIndex = 0;
        // Split the input string by one or more newline or space characters.
        this.parsedElements = sourceText.split(/[\n\s]+/);
    }

    /**
     * Fetches the next element as an integer.
     * @returns {number} The parsed integer.
     */
    fetchInteger() {
        // Use unary plus for type conversion to number.
        return +this.parsedElements[this.currentIndex++];
    }

    /**
     * Fetches an array of integers of a specified size.
     * @param {number} size - The number of integers to fetch.
     * @returns {number[]} An array of parsed integers.
     * @throws {Error} If size is undefined.
     */
    fetchIntegerArray(size) {
        if (typeof size === 'undefined') {
            throw new Error('引数（1以上）を省略できません！'); // Error message remains identical.
        }
        let resultArr = new Array(size);
        for (let elementIndex = 0; elementIndex < size; ++elementIndex) {
            resultArr[elementIndex] = this.fetchInteger();
        }
        return resultArr;
    }

    /**
     * Fetches the next element as a string.
     * @returns {string} The parsed string.
     */
    fetchString() {
        return this.parsedElements[this.currentIndex++];
    }

    /**
     * Fetches an array of strings of a specified count.
     * @param {number} count - The number of strings to fetch.
     * @returns {string[]} An array of parsed strings.
     * @throws {Error} If count is undefined.
     */
    fetchStringArray(count) {
        if (typeof count === 'undefined') {
            throw new Error('引数（1以上）を省略できません！'); // Error message remains identical.
        }
        let stringCollection = new Array(count);
        for (let k = 0; k < count; ++k) {
            stringCollection[k] = this.fetchString();
        }
        return stringCollection;
    }
}

// Check if the code is running in a Node.js-like environment (not a browser).
if (typeof window === "undefined") {
    // Read input from standard input and pass it to the main processing function.
    ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
}

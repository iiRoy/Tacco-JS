"use strict";

/**
 * Main processing function for the input data.
 * This function calculates the maximum GCD of all possible subarrays
 * by using prefix and suffix GCD arrays.
 * @param {string} rawData - The entire input string from stdin.
 */
function ProcessInput(rawData) {
    // Initialize a data parser to handle input tokens.
    let dataParser = new DataStreamProcessor(rawData);

    // Read the number of elements.
    let countElements = dataParser.getInt();
    // Read the array of integer values.
    let numericValues = dataParser.getIntArray(countElements);

    /**
     * Computes the greatest common divisor (GCD) of two non-negative integers.
     * This is a recursive implementation of the Euclidean algorithm.
     * @param {number} firstNum - The first integer.
     * @param {number} secondNum - The second integer.
     * @returns {number} The greatest common divisor of firstNum and secondNum.
     */
    const findGCD = (firstNum, secondNum) => {
        // Base case: if secondNum is 0, then firstNum is the GCD.
        return secondNum ? findGCD(secondNum, firstNum % secondNum) : firstNum;
    };

    // Initialize an array to store prefix GCDs.
    // prefixGCDs[k] will store the GCD of numericValues[0]...numericValues[k-1].
    // The array size is countElements + 1 to handle boundary conditions.
    let prefixGCDs = new Array(countElements + 1);
    prefixGCDs[0] = 0; // GCD with 0 is the other number, useful for initial state.

    // Initialize an array to store suffix GCDs.
    // suffixGCDs[k] will store the GCD of numericValues[k]...numericValues[countElements-1].
    // The array size is countElements + 1 to handle boundary conditions.
    let suffixGCDs = new Array(countElements + 1);
    suffixGCDs[countElements] = 0; // GCD with 0 is the other number, useful for initial state.

    // Populate the prefix GCD array.
    // prefixGCDs[idx+1] = GCD(prefixGCDs[idx], numericValues[idx])
    for (let idx = 0; idx < countElements; idx++) {
        prefixGCDs[idx + 1] = findGCD(prefixGCDs[idx], numericValues[idx]);
    }

    // Populate the suffix GCD array.
    // suffixGCDs[idx] = GCD(suffixGCDs[idx+1], numericValues[idx])
    for (let idx = countElements - 1; idx >= 0; idx--) {
        suffixGCDs[idx] = findGCD(suffixGCDs[idx + 1], numericValues[idx]);
    }

    // Initialize an array to store the GCDs when one element is removed.
    // combinedGCDs[idx] will store GCD(prefixGCDs[idx], suffixGCDs[idx+1]).
    // This represents the GCD of the array if numericValues[idx] were removed.
    let combinedGCDs = new Array(countElements);
    for (let idx = 0; idx < countElements; idx++) {
        combinedGCDs[idx] = findGCD(prefixGCDs[idx], suffixGCDs[idx + 1]);
    }

    // Output the maximum value found in the combined GCDs array.
    // This is the maximum possible GCD of the array after removing one element.
    console.log(Math.max(...combinedGCDs));
}

/**
 * Helper class for parsing input strings into various data types.
 * It tokenizes the input by newlines and spaces and provides methods
 * to retrieve integers and strings sequentially.
 */
class DataStreamProcessor {
    /**
     * Constructs a new DataStreamProcessor instance.
     * @param {string} sourceText - The raw input string to be processed.
     * @throws {Error} If sourceText is undefined.
     */
    constructor(sourceText) {
        if (typeof sourceText === 'undefined') {
            throw new Error('引数（stdin）を省略できません！');
        }
        // Initialize the current index for token retrieval.
        this.currentIndex = 0;
        // Split the input string into tokens using newlines or spaces as delimiters.
        this.parsedTokens = sourceText.split(/\n|\s/);
    }

    /**
     * Retrieves the next token as an integer.
     * @returns {number} The next integer from the input stream.
     */
    getInt() {
        // Convert the string token to a number using unary plus operator.
        return +this.parsedTokens[this.currentIndex++];
    }

    /**
     * Retrieves a specified number of tokens as an array of integers.
     * @param {number} numItems - The number of integers to retrieve. Must be 1 or greater.
     * @returns {number[]} An array containing the retrieved integers.
     * @throws {Error} If numItems is undefined.
     */
    getIntArray(numItems) {
        if (typeof numItems === 'undefined') {
            throw new Error('引数（1以上）を省略できません！');
        }
        let resultArray = new Array(numItems);
        for (let elementIndex = 0; elementIndex < numItems; elementIndex++) {
            resultArray[elementIndex] = this.getInt();
        }
        return resultArray;
    }

    /**
     * Retrieves the next token as a string.
     * @returns {string} The next string token from the input stream.
     */
    getStr() {
        return this.parsedTokens[this.currentIndex++];
    }

    /**
     * Retrieves a specified number of tokens as an array of strings.
     * @param {number} numItems - The number of strings to retrieve. Must be 1 or greater.
     * @returns {string[]} An array containing the retrieved strings.
     * @throws {Error} If numItems is undefined.
     */
    getStrArray(numItems) {
        if (typeof numItems === 'undefined') {
            throw new Error('引数（1以上）を省略できません！');
        }
        let resultArray = new Array(numItems);
        for (let elementIndex = 0; elementIndex < numItems; elementIndex++) {
            resultArray[elementIndex] = this.getStr();
        }
        return resultArray;
    }
}

// Entry point for execution:
// If running in a Node.js environment (i.e., not in a browser),
// read input from stdin and pass it to the main processing function.
if (typeof window === "undefined") {
    ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
}

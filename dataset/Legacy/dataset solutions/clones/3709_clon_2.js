"use strict"; // Enforce strict mode for better code quality.

/**
 * Primary function to process the given input data and compute the required result.
 * @param {string} rawData - The complete input string, typically from standard input.
 */
function ProcessData(rawData) {
    // Initialize an input parsing utility with the provided raw data.
    let dataParser = new DataProcessor(rawData);

    // Obtain the total count of elements from the input.
    let elementCount = dataParser.retrieveInteger();

    // Fetch an array of integers based on the previously read count.
    let originalValues = dataParser.retrieveIntegerArray(elementCount);

    // Create a new array by transforming each element: value - index - 1.
    let transformedValues = originalValues.map((currentVal, currentIndex) => {
        return currentVal - currentIndex - 1;
    });

    // Arrange the transformed values in ascending numerical order.
    transformedValues.sort((valA, valB) => valA - valB);

    // Determine the index of the median element in the sorted transformed array.
    let medianIndex = Math.floor(elementCount / 2);

    // Extract the median value using the calculated median index.
    let medianVal = transformedValues[medianIndex];

    // Compute the final sum of absolute differences using a reduction operation.
    let finalResult = originalValues.reduce((accumulator, itemValue, itemIndex) => {
        // Calculate the target value for the current item based on the median and its index.
        let target = medianVal + itemIndex + 1;
        // Add the absolute difference between the item's value and its target to the accumulator.
        return accumulator + Math.abs(itemValue - target);
    }, 0); // The initial value for the accumulator is zero.

    // Display the final calculated result to the console.
    console.log(finalResult);
}

/**
 * Utility class designed for parsing various data types from a string source.
 * It tokenizes the input string and provides methods to sequentially retrieve integers or strings.
 */
class DataProcessor {
    /**
     * Constructs an instance of the DataProcessor.
     * @param {string} sourceText - The entire string content to be parsed.
     */
    constructor(sourceText) {
        // Validate that the source text is provided.
        if (typeof sourceText === 'undefined') {
            throw new Error('The input source text parameter cannot be omitted!');
        }
        // Initialize a counter to keep track of the current parsing position.
        this.positionCounter = 0;
        // Split the source text into individual tokens using newlines or spaces as delimiters.
        this.parsedTokens = sourceText.split(/\n|\s/);
    }

    /**
     * Retrieves the next available token as an integer.
     * @returns {number} The integer value of the next token.
     */
    retrieveInteger() {
        // Convert the current token to a number (using unary minus for type coercion) and advance the counter.
        return this.parsedTokens[this.positionCounter++] - 0;
    }

    /**
     * Retrieves an array of integers of a specified length.
     * @param {number} arraySize - The desired number of integers in the array.
     * @returns {number[]} An array containing the retrieved integers.
     */
    retrieveIntegerArray(arraySize) {
        // Validate the array size parameter.
        if (typeof arraySize === 'undefined') {
            throw new Error('The array size parameter for integer array retrieval cannot be omitted!');
        }
        if (arraySize < 1) {
            throw new Error('The array size must be 1 or greater for integer array retrieval!');
        }
        // Create a new array to store the results.
        let resultArray = new Array(arraySize);
        // Populate the array by repeatedly calling retrieveInteger.
        for (let loopIndex = 0; loopIndex < arraySize; loopIndex++) {
            resultArray[loopIndex] = this.retrieveInteger();
        }
        return resultArray;
    }

    /**
     * Retrieves the next available token as a string.
     * @returns {string} The string value of the next token.
     */
    retrieveString() {
        // Return the current token as a string and advance the counter.
        return this.parsedTokens[this.positionCounter++];
    }

    /**
     * Retrieves an array of strings of a specified length.
     * @param {number} strArraySize - The desired number of strings in the array.
     * @returns {string[]} An array containing the retrieved strings.
     */
    retrieveStringArray(strArraySize) {
        // Validate the string array size parameter.
        if (typeof strArraySize === 'undefined') {
            throw new Error('The string array size parameter for string array retrieval cannot be omitted!');
        }
        if (strArraySize < 1) {
            throw new Error('The string array size must be 1 or greater for string array retrieval!');
        }
        // Create a new array to store the string results.
        let strResultArray = new Array(strArraySize);
        // Populate the array by repeatedly calling retrieveString.
        for (let strLoopIndex = 0; strLoopIndex < strArraySize; strLoopIndex++) {
            strResultArray[strLoopIndex] = this.retrieveString();
        }
        return strResultArray;
    }
}

// This block checks if the script is running in a Node.js environment (not a web browser).
if (typeof window === "undefined") {
    // If in Node.js, read the input from standard input and pass it to the main processing function.
    ProcessData(require("fs").readFileSync("/dev/stdin", "utf8"));
}

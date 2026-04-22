"use strict";
// The primary execution function for processing input data
function ProcessInput(sourceText) {
    // Initialize a utility to parse input tokens
    let dataFetcher = new InputAdapter(sourceText);

    // Fetch the total count of elements and the array of numbers
    let itemCount = dataFetcher.obtainInt();
    let inputNumbers = dataFetcher.obtainIntArray(itemCount);

    // Define a constant for the maximum number of bits to consider for each number
    const BINARY_WIDTH = 20;

    // Helper function to convert a decimal number to a fixed-width binary string
    // It pads with leading zeros and takes the last BINARY_WIDTH characters.
    const formatAsBinary = (decimalValue) => {
        return ('0'.repeat(BINARY_WIDTH - 1) + (1 * decimalValue).toString(2)).slice(-BINARY_WIDTH);
    };

    // Initialize a 2D array to store cumulative bit counts.
    // The dimensions are (itemCount + 1) rows by BINARY_WIDTH columns.
    // Each cell will store the count of a specific bit position up to that index.
    let cumulativeBitCounts = Array.from({ length: itemCount + 1 }, () => new Array(BINARY_WIDTH).fill(0));
    // Ensure the first row (representing counts before any number) is all zeros.
    cumulativeBitCounts[0].fill(0);

    // Iterate through the input numbers to populate the cumulative bit counts matrix.
    for (let currentPos = 1; currentPos <= itemCount; ++currentPos) {
        // Get the binary string representation for the current number.
        let binaryString = formatAsBinary(inputNumbers[currentPos - 1]);
        // For each bit position, add its value (0 or 1) to the previous cumulative sum.
        for (let bitPosition = 0; bitPosition < BINARY_WIDTH; ++bitPosition) {
            cumulativeBitCounts[currentPos][bitPosition] = cumulativeBitCounts[currentPos - 1][bitPosition] + (binaryString[bitPosition] * 1);
        }
    }

    // Initialize a counter for valid subarrays.
    let validSubsegments = 0;

    // Iterate through all possible starting positions of subarrays.
    for (let startIdx = 1; startIdx <= itemCount; startIdx++) {
        let allUniqueBits = true; // Flag to track if the current subarray has unique bits.
        // Iterate through all possible ending positions of subarrays, starting from startIdx.
        for (let endIdx = startIdx; endIdx <= itemCount && allUniqueBits; endIdx++) {
            // Check each bit position within the current subarray [startIdx, endIdx].
            for (let bitPos = 0; bitPos < BINARY_WIDTH && allUniqueBits; bitPos++) {
                // Calculate the count of the current bit (bitPos) within the subarray.
                // This is done by subtracting the cumulative count at (startIdx - 1) from the count at endIdx.
                if (cumulativeBitCounts[endIdx][bitPos] - cumulativeBitCounts[startIdx - 1][bitPos] > 1) {
                    allUniqueBits = false; // If any bit appears more than once, this subarray is invalid.
                }
            }
            // If the subarray is valid (all bits appear 0 or 1 time), increment the counter.
            if (allUniqueBits) {
                validSubsegments++;
            } else {
                // If this subarray is invalid, any subsequent subarray starting at `startIdx`
                // and extending past `endIdx` will also be invalid. So, break early.
                break;
            }
        }
    }
    // Output the final count of valid subarrays.
    console.log(validSubsegments);
}

// A utility class for parsing various data types from a string input.
class InputAdapter {
    // Constructor: Takes a string containing input data.
    constructor(rawContent) {
        if (typeof rawContent === 'undefined') {
            throw new Error('Input source string cannot be omitted!');
        }
        // Initialize a pointer to keep track of the current reading position.
        this.positionCounter = 0;
        // Split the input string into an array of tokens using newlines or spaces as delimiters.
        this.dataTokens = rawContent.split(/\n|\s/);
    }

    // Method to obtain the next integer from the parsed tokens.
    obtainInt() {
        // Return the current token converted to a number, then advance the pointer.
        return Number(this.dataTokens[this.positionCounter++]);
    }

    // Method to obtain an array of integers.
    // 'quantity' specifies how many integers to read.
    obtainIntArray(quantity) {
        if (typeof quantity === 'undefined' || quantity < 1) {
            throw new Error('Quantity argument must be a positive integer!');
        }
        let extractedNumbers = new Array(quantity);
        // Loop to read the specified number of integers.
        for (let arrayIndex = 0; arrayIndex < quantity; arrayIndex++) {
            extractedNumbers[arrayIndex] = this.obtainInt();
        }
        return extractedNumbers;
    }

    // Method to obtain the next string token.
    obtainString() {
        // Return the current token, then advance the pointer.
        return this.dataTokens[this.positionCounter++];
    }

    // Method to obtain an array of string tokens.
    // 'quantity' specifies how many strings to read.
    obtainStrings(quantity) {
        if (typeof quantity === 'undefined' || quantity < 1) {
            throw new Error('Quantity argument must be a positive integer!');
        }
        let tokenCollection = new Array(quantity);
        // Loop to read the specified number of strings.
        for (let arrayIndex = 0; arrayIndex < quantity; arrayIndex++) {
            tokenCollection[arrayIndex] = this.obtainString();
        }
        return tokenCollection;
    }
}

// Check if the script is running in a Node.js environment (not a browser).
// If in Node.js, read input from standard input and pass it to the main processing function.
if (typeof window === "undefined") {
    ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
}
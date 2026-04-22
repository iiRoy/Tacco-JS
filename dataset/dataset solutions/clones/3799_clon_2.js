"use strict"; // Enable strict mode for better error handling and cleaner code

 // Main function to process the input data and compute the result
function ProcessData(dataStream) {
    // Initialize a data reader utility to parse input values
    let dataReader = new StreamProcessor(dataStream);

    // Read the total number of elements and the array of integers
    let elementCount = dataReader.extractInteger();
    let sourceArray = dataReader.extractIntegerSequence(elementCount);

    // Define a constant for the maximum bit length to consider for each number
    const BIT_LENGTH = 20;

    // Create a 2D array to store prefix sums of bits.
    // The dimensions are (elementCount + 1) x BIT_LENGTH.
    // Initialize all cells to zero.
    let prefixBitSums = Array(elementCount + 1)
                            .fill(null)
                            .map(() => Array(BIT_LENGTH).fill(0));

    // The first row (index 0) is implicitly filled with zeros by the initialization above.
    // Explicitly ensure it if necessary, though the map handles it.
    prefixBitSums[0].fill(0);

    // Iterate through the source array to populate the prefixBitSums array.
    // prefixBitSums[idx][bitPos] will store the count of the 'bitPos'-th bit being set
    // in the subarray sourceArray[0...idx-1].
    for (let outerIndex = 1; outerIndex <= elementCount; outerIndex++) {
        // Loop through each bit position from most significant to least significant
        // The bitMask starts at 2^(BIT_LENGTH-1) and shifts right.
        for (let bitPos = 0, bitMask = 1 << (BIT_LENGTH - 1);
             bitPos < BIT_LENGTH;
             bitPos++, bitMask >>= 1) {
            // Calculate the prefix sum for the current bit position.
            // If the (outerIndex-1)-th element in sourceArray has the current bit set, add 1.
            prefixBitSums[outerIndex][bitPos] = prefixBitSums[outerIndex - 1][bitPos] +
                                                ((sourceArray[outerIndex - 1] & bitMask) ? 1 : 0);
        }
    }

    // Initialize a counter for the valid segments found
    let resultCount = 0;

    // Iterate through all possible starting points of a segment
    for (let startIdx = 1; startIdx <= elementCount; startIdx++) {
        // Flag to track if the current segment (from startIdx to current endIdx) is valid
        let isValidSegment = true;

        // Iterate through all possible ending points of a segment, starting from startIdx
        for (let endIdx = startIdx; endIdx <= elementCount && isValidSegment; endIdx++) {
            // Check each bit position for the current segment [startIdx-1 ... endIdx-1]
            for (let currentBit = 0; currentBit < BIT_LENGTH && isValidSegment; currentBit++) {
                // Calculate the count of the 'currentBit' being set within the segment
                // by subtracting prefix sums: prefixBitSums[endIdx][currentBit] - prefixBitSums[startIdx-1][currentBit]
                if (prefixBitSums[endIdx][currentBit] - prefixBitSums[startIdx - 1][currentBit] > 1) {
                    // If any bit appears more than once in the segment, it's not valid
                    isValidSegment = false;
                }
            }

            // If the segment is still valid after checking all bits, increment the result count
            if (isValidSegment) {
                resultCount++;
            } else {
                // If the segment becomes invalid, any further segments starting at startIdx
                // and extending past endIdx will also be invalid. So, break early.
                break;
            }
        }
    }

    // Output the final computed count
    console.log(resultCount);
}

// Utility class for processing input strings, tokenizing them, and extracting various data types.
class StreamProcessor {
    // Constructor initializes the processor with the raw input string.
    constructor(sourceContent) {
        // Ensure that input content is provided.
        if (typeof sourceContent === 'undefined') {
            throw new Error('Input content parameter cannot be omitted!');
        }
        // Initialize a pointer for reading tokens and split the content into tokens.
        this.readPointer = 0;
        this.contentTokens = sourceContent.split(/\n|\s/);
    }

    // Extracts and returns the next integer from the token stream.
    extractInteger() {
        // Convert the current token to a number and increment the pointer.
        return this.contentTokens[this.readPointer++] - 0;
    }

    // Extracts a sequence of 'count' integers from the token stream.
    extractIntegerSequence(count) {
        // Ensure that a count for the sequence length is provided.
        if (typeof count === 'undefined') {
            throw new Error('Sequence length parameter (must be 1 or greater) cannot be omitted!');
        }
        // Create an array to store the extracted integers.
        let sequenceBuffer = Array(count);
        // Populate the array by repeatedly calling extractInteger.
        for (let itemIndex = 0; itemIndex < count; itemIndex++) {
            sequenceBuffer[itemIndex] = this.extractInteger();
        }
        return sequenceBuffer;
    }

    // Extracts and returns the next string token from the stream.
    extractString() {
        return this.contentTokens[this.readPointer++];
    }

    // Extracts a sequence of 'count' string tokens from the stream.
    extractStringSequence(count) {
        // Ensure that a count for the sequence length is provided.
        if (typeof count === 'undefined') {
            throw new Error('Sequence length parameter (must be 1 or greater) cannot be omitted!');
        }
        // Create an array to store the extracted strings.
        let sequenceBuffer = Array(count);
        // Populate the array by repeatedly calling extractString.
        for (let itemIndex = 0; itemIndex < count; itemIndex++) {
            sequenceBuffer[itemIndex] = this.extractString();
        }
        return sequenceBuffer;
    }
}

// Check if the code is running in a Node.js-like environment (not a browser).
// If so, read from standard input and pass it to the main processing function.
if (typeof window === "undefined") {
    ProcessData(require("fs").readFileSync("/dev/stdin", "utf8"));
}
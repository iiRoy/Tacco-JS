const InputProcessor = (function() {
    /**
     * Internal constructor for the input reader.
     * @param {string} rawInputContent - The raw string content from the input source.
     */
    function InputReader(rawInputContent) {
        // Normalize line endings and split into an array of lines.
        // Filter out any empty lines that might result from extra newlines.
        this._lineBuffer = rawInputContent.trim().split('\n').filter(line => line.length > 0);
        this._currentLinePointer = 0; // Tracks the current line being processed.
    }

    /**
     * Helper to convert a string token to a number, or return as string.
     * @param {string} token - The string token to convert.
     * @param {boolean} returnAsString - If true, returns token as string; otherwise, converts to number.
     * @returns {string|number} The processed token.
     */
    function convertToken(token, returnAsString) {
        return returnAsString ? token : Number(token);
    }

    // Prototype methods for the InputReader
    Object.assign(InputReader.prototype, {
        /**
         * Extracts the next token from the current line, reading from right to left.
         * If the current line is exhausted, it advances to the next line.
         * @param {boolean} keepAsText - If true, returns the token as a string; otherwise, converts to a number.
         * @returns {string|number|null} The extracted token, or null if no more input.
         */
        readTokenRightToLeft(keepAsText) {
            // Ensure we are on a valid line within the buffer.
            if (this._currentLinePointer >= this._lineBuffer.length) {
                return null; // No more input lines available.
            }

            let currentLine = this._lineBuffer[this._currentLinePointer];

            // If the current line hasn't been split into tokens yet, do so and reverse for right-to-left reading.
            if (typeof currentLine === 'string') {
                this._lineBuffer[this._currentLinePointer] = currentLine.split(' ').reverse();
            }

            const tokensOnCurrentLine = this._lineBuffer[this._currentLinePointer];

            // If no tokens left on the current line (or line was empty), advance to the next line and try again.
            if (!tokensOnCurrentLine || tokensOnCurrentLine.length === 0) {
                this._currentLinePointer++;
                // Recursively call to handle subsequent empty lines or move to the next valid line.
                return this.readTokenRightToLeft(keepAsText);
            }

            const extractedToken = tokensOnCurrentLine.pop(); // Extracts from the end of the reversed array.
            
            // If the line is now empty after popping, increment the line pointer for the next read.
            if (tokensOnCurrentLine.length === 0) {
                this._currentLinePointer++;
            }
            
            return convertToken(extractedToken, keepAsText);
        },

        /**
         * Reads an entire line, splits it by spaces, and returns the tokens.
         * Advances the line pointer.
         * @param {boolean} returnAsStrings - If true, returns tokens as strings; otherwise, converts to numbers.
         * @returns {Array<string|number>} An array of tokens from the line.
         */
        readLineTokens(returnAsStrings) {
            if (this._currentLinePointer >= this._lineBuffer.length) {
                return []; // No more input lines.
            }

            const lineContent = this._lineBuffer[this._currentLinePointer++];
            const tokens = lineContent.split(' ');
            
            // Apply number conversion if not explicitly keeping as strings.
            return returnAsStrings ? tokens : tokens.map(token => Number(token));
        },

        /**
         * Reads 'numLines' lines, splitting each by spaces, and returns them as a 2D array.
         * Advances the line pointer by 'numLines'.
         * @param {number} numLines - The number of lines to read.
         * @param {boolean} keepAllStrings - If true, all tokens are kept as strings; otherwise, converted to numbers.
         * @returns {Array<Array<string|number>>} A 2D array of tokens.
         */
        readMatrix(numLines, keepAllStrings) {
            const resultMatrix = [];
            for (let i = 0; i < numLines; i++) {
                if (this._currentLinePointer >= this._lineBuffer.length) {
                    break; // Ran out of lines prematurely.
                }
                const currentLineContent = this._lineBuffer[this._currentLinePointer++];
                const lineTokens = currentLineContent.split(' ');
                resultMatrix.push(keepAllStrings ? lineTokens : lineTokens.map(token => Number(token)));
            }
            return resultMatrix;
        },

        /**
         * Reads 'numLines' lines as raw strings (or converted to numbers if specified).
         * Advances the line pointer by 'numLines'.
         * @param {number} numLines - The number of lines to read.
         * @param {boolean} convertToNumbers - If true, attempts to convert each line to a number.
         * @returns {Array<string|number>} An array of raw line strings or numbers.
         */
        readRawLines(numLines, convertToNumbers) {
            // Slice creates a new array without modifying the original buffer.
            const rawLines = this._lineBuffer.slice(this._currentLinePointer, this._currentLinePointer + numLines);
            this._currentLinePointer += numLines; // Advance the pointer after slicing.
            return convertToNumbers ? rawLines.map(line => Number(line)) : rawLines;
        }
    });

    /**
     * Factory function to create an InputReader instance.
     * @param {string} sourceContent - The raw string content to be parsed.
     * @returns {InputReader} A new instance of InputReader.
     */
    return function createInputParser(sourceContent) {
        return new InputReader(sourceContent);
    };
})();


// --- Main Program Logic ---

// Define constants for clarity and easier modification.
const MAX_BIT_POSITION = 28; // The highest bit position to consider (0-indexed).
const CRITICAL_BIT_THRESHOLD = 17; // A specific bit position that changes algorithm behavior.
const STANDARD_INPUT_PATH = "/dev/stdin";
const FILE_ENCODING_UTF8 = "utf8";

/**
 * Identifies numbers in an array that occur an odd number of times,
 * considering values up to a specific bit length. This is a specialized frequency counter.
 * @param {Array<number>} dataArray - The input array of numeric data.
 * @param {number} bitLengthExponent - Defines the maximum value range (0 to (2^(exponent+1))-1).
 * @returns {Array<number>} An array containing numbers with odd frequencies within the defined range.
 */
function extractOddFrequencyElements(dataArray, bitLengthExponent) {
    // Create a frequency map. Array size is 2^(bitLengthExponent+1) to cover all values.
    const frequencyMap = new Array(1 << (bitLengthExponent + 1)).fill(0);
    const oddOccurrenceList = [];

    // Increment counts for each number in the input array.
    for (const value of dataArray) {
        // Guard clause: Ensure value is within the bounds of the frequency map.
        // This prevents potential out-of-bounds access if input data is unexpected.
        if (value >= 0 && value < frequencyMap.length) {
            frequencyMap[value]++;
        }
    }

    // Iterate through the frequency map to find elements with odd counts.
    for (let currentMappedValue = 0; currentMappedValue < frequencyMap.length; currentMappedValue++) {
        // Use bitwise AND with 1 to check for oddness (faster than modulo).
        if (frequencyMap[currentMappedValue] & 1) {
            oddOccurrenceList.push(currentMappedValue);
        }
    }
    return oddOccurrenceList;
}

// Initialize the input data parser by reading from standard input.
let dataParserInstance;
try {
    const fileSystemModule = require("fs"); // Dynamically require Node.js 'fs' module.
    const rawInputContent = fileSystemModule.readFileSync(STANDARD_INPUT_PATH, FILE_ENCODING_UTF8);
    dataParserInstance = InputProcessor(rawInputContent);
} catch (error) {
    // Provide detailed error feedback for a Type III enhancement.
    console.error("Critical error: Could not read input from '" + STANDARD_INPUT_PATH + "'.", error.message);
    // Terminate the process as input is essential for execution.
    process.exit(1);
}

// Invoke the main problem-solving routine and output its result.
console.log(solveProblem());

/**
 * Implements the core algorithm to process two arrays based on bitwise operations.
 * This function likely calculates a specific XOR-based sum or count.
 * @returns {number} The final computed numerical result.
 */
function solveProblem() {
    // Read the initial problem parameters using the data parser.
    const initialElementCount = dataParserInstance.readTokenRightToLeft(); // Represents 'n' from original code.
    let firstDataSet = dataParserInstance.readLineTokens(); // Represents 'a' from original code.
    let secondDataSet = dataParserInstance.readLineTokens(); // Represents 'b' from original code.

    let finalCumulativeXORSum = 0; // Accumulator for the result, 'ans' in original.

    // Main loop iterates downwards through bit positions.
    for (let currentBitPosition = MAX_BIT_POSITION; currentBitPosition >= 0; currentBitPosition--) {
        // Apply different array processing logic based on the current bit position.
        if (currentBitPosition < CRITICAL_BIT_THRESHOLD) {
            // For lower bit positions, use the custom odd frequency extraction logic.
            secondDataSet = extractOddFrequencyElements(secondDataSet, currentBitPosition);
            // The first data set is also processed for odd frequencies, then reversed.
            firstDataSet = extractOddFrequencyElements(firstDataSet, currentBitPosition).reverse();
        } else {
            // For higher bit positions, perform standard sorting.
            // Sort `secondDataSet` in ascending order.
            secondDataSet.sort((valX, valY) => valX - valY);
            // Sort `firstDataSet` in descending order.
            firstDataSet.sort((valX, valY) => valY - valX);
        }

        // Calculate bit-related thresholds for the current iteration.
        const currentBitValue = 1 << currentBitPosition; // Equivalent to 2^currentBitPosition.
        const doubleBitValue = currentBitValue * 2; // Equivalent to 2^(currentBitPosition+1).
        const tripleBitValue = currentBitValue * 3; // Equivalent to 3 * 2^currentBitPosition.

        // Initialize counters for the current bit position's parity calculation.
        let dynamicXORParityCount = initialElementCount; // 'x' in original.
        let pointerOne = 0; // Tracks elements for `currentBitValue` threshold ('x1').
        let pointerTwo = 0; // Tracks elements for `doubleBitValue` threshold ('x2').
        let pointerThree = 0; // Tracks elements for `tripleBitValue` threshold ('x3').

        // Iterate through each element in the first data set.
        for (let primaryDataIndex = 0; primaryDataIndex < firstDataSet.length; primaryDataIndex++) {
            const currentPrimaryElement = firstDataSet[primaryDataIndex];

            // Use 'while' loops to efficiently count elements in `secondDataSet` that satisfy conditions.
            // These pointers effectively find the boundary for elements less than a target value.

            // Count elements in `secondDataSet` such that `currentBitValue - currentPrimaryElement > element`.
            while (pointerOne < secondDataSet.length && (currentBitValue - currentPrimaryElement) > secondDataSet[pointerOne]) {
                pointerOne++;
            }
            // Count elements in `secondDataSet` such that `doubleBitValue - currentPrimaryElement > element`.
            while (pointerTwo < secondDataSet.length && (doubleBitValue - currentPrimaryElement) > secondDataSet[pointerTwo]) {
                pointerTwo++;
            }
            // Count elements in `secondDataSet` such that `tripleBitValue - currentPrimaryElement > element`.
            while (pointerThree < secondDataSet.length && (tripleBitValue - currentPrimaryElement) > secondDataSet[pointerThree]) {
                pointerThree++;
            }

            // Update the dynamic XOR parity count based on the calculated pointers.
            // The specific combination `(pointerTwo - pointerOne) - pointerThree` implies
            // a count of elements within a specific range or set of ranges.
            dynamicXORParityCount += (pointerTwo - pointerOne) - pointerThree;
        }

        // If the calculated dynamic XOR parity count is odd, add the current bit's value to the final sum.
        if (dynamicXORParityCount & 1) { // Check for oddness using bitwise AND.
            finalCumulativeXORSum += currentBitValue;
        }

        // Prepare both data sets for the next iteration by applying a bitwise mask.
        // The mask `currentBitValue - 1` effectively zeroes out the `currentBitPosition` and higher bits.
        const maskingValue = currentBitValue - 1; 
        
        firstDataSet = firstDataSet.map(element => element & maskingValue);
        secondDataSet = secondDataSet.map(element => element & maskingValue);
    }

    return finalCumulativeXORSum;
}
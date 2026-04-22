const STDIN_SOURCE_PATH = "/dev/stdin";
const ERROR_NO_MORE_ELEMENTS = "Iterator exhaustion: No more elements available.";
const INVALID_TRANSFORMATION_MODE_WARNING = "Warning: Unknown transformation mode encountered. Returning original value.";

/**
 * Checks if a number is odd.
 * @param {number} num - The number to check.
 * @returns {boolean} True if odd, false if even.
 */
function isOddNumber(num) {
    return num % 2 !== 0;
}

/**
 * Checks if a number is even.
 * @param {number} num - The number to check.
 * @returns {boolean} True if even, false if odd.
 */
function isEvenNumber(num) {
    return num % 2 === 0;
}

/**
 * Outputs a message to standard output.
 * @param {*} message - The message to display.
 */
function printApplicationResult(message) {
    console.log(message);
}

/**
 * Logs an error message to standard error.
 * @param {*} errorDetail - The error information to log.
 */
function logProcessingError(errorDetail) {
    console.error(errorDetail);
}

/**
 * Provides various data conversion capabilities.
 * @param {string | string[]} sourceInput - The input data to transform.
 * @param {number} transformationMode - The mode indicating the desired transformation.
 * @returns {*} The transformed data.
 */
function performDataConversion(sourceInput, transformationMode) {
    try {
        const isInputString = typeof sourceInput === 'string';
        const isInputArray = Array.isArray(sourceInput);

        // Guard clauses for expected input types based on transformation mode
        if ((transformationMode >= 1 && transformationMode <= 7) && !isInputString) {
            if (transformationMode === 1 && typeof sourceInput === 'number') {
                return sourceInput; // Already a number for parseInt mode
            }
            logProcessingError(`Data conversion warning: Expected string input for mode ${transformationMode}, but received ${typeof sourceInput}. Returning original value.`);
            return sourceInput;
        }
        if ((transformationMode >= 8 && transformationMode <= 0) && !isInputArray) {
            logProcessingError(`Data conversion warning: Expected array input for mode ${transformationMode}, but received ${typeof sourceInput}. Returning original value.`);
            return sourceInput;
        }

        switch (transformationMode) {
            case 1: // Convert to integer
                return Number.parseInt(sourceInput, 10);
            case 2: // Split by space
                return sourceInput.split(" ");
            case 4: // Split by space and convert to number array
                return sourceInput.split(" ").map(item => Number(item));
            case 6: // Split by character
                return sourceInput.split("");
            case 7: // Split by character and convert to number array
                return sourceInput.split("").map(item => Number(item));
            case 8: // Join by space
                return sourceInput.join(" ");
            case 9: // Join by newline
                return sourceInput.join("\n");
            case 0: // Join without separator
                return sourceInput.join("");
            default: // Unknown mode
                logProcessingError(`${INVALID_TRANSFORMATION_MODE_WARNING} Mode: ${transformationMode}`);
                return sourceInput;
        }
    } catch (conversionError) {
        logProcessingError(`Error during data conversion (Mode: ${transformationMode}, Input: ${JSON.stringify(sourceInput)}): ${conversionError.message}`);
        return sourceInput; // Fallback to original input on error
    }
}

/**
 * Creates an iterator for an array of lines.
 * @param {string[]} linesArray - The array of input lines.
 * @returns {object} An iterator object.
 */
function createInputLineIterator(linesArray) {
    if (!Array.isArray(linesArray)) {
        logProcessingError("Input to createInputLineIterator must be an array. Initializing with an empty array.");
        linesArray = [];
    }

    let currentPosition = 0;
    const itemBuffer = linesArray;
    const totalLinesCount = itemBuffer.length;

    return {
        sourceLines: itemBuffer,
        currentLineIndex: currentPosition,
        totalLinesCount: totalLinesCount,

        /**
         * Retrieves the next element from the iterator.
         * @returns {string} The next line.
         * @throws {Error} If no more elements are available.
         */
        getNextLine: function() {
            if (!this.hasRemainingLines()) {
                throw new Error(ERROR_NO_MORE_ELEMENTS);
            }
            const retrievedItem = this.sourceLines[this.currentLineIndex];
            this.currentLineIndex++;
            return retrievedItem;
        },

        /**
         * Checks if there are more elements in the iterator.
         * @returns {boolean} True if more elements exist, false otherwise.
         */
        hasRemainingLines: function() {
            return this.sourceLines && this.currentLineIndex < this.totalLinesCount;
        },

        /**
         * Peeks at the next element without advancing the iterator.
         * @returns {string | undefined} The next line, or undefined if no more elements.
         */
        peekNextLine: function() {
            if (this.hasRemainingLines()) {
                return this.sourceLines[this.currentLineIndex];
            }
            return undefined;
        },

        /**
         * Resets the iterator to the beginning.
         */
        resetIterator: function() {
            this.currentLineIndex = 0;
        }
    };
}

let applicationInputIterator; // Global iterator instance

/**
 * Fetches the next available input line.
 * @returns {string} The next line.
 */
function retrieveNextInputLine() {
    if (!applicationInputIterator) {
        throw new Error("Input iterator not initialized. Call initializeApplicationInput first.");
    }
    return applicationInputIterator.getNextLine();
}

/**
 * Checks if more input lines are available.
 * @returns {boolean} True if more lines exist, false otherwise.
 */
function checkInputAvailability() {
    if (!applicationInputIterator) {
        return false;
    }
    return applicationInputIterator.hasRemainingLines();
}

/**
 * Initializes the application's input stream from a file.
 * This function encapsulates the initial input reading and error handling.
 */
function initializeApplicationInput() {
    try {
        const fileContent = require('node:fs').readFileSync(STDIN_SOURCE_PATH, "utf8");
        // Filter out empty lines to ensure robustness
        const processedLines = fileContent.trim().split("\n").filter(line => line.length > 0);
        applicationInputIterator = createInputLineIterator(processedLines);
    } catch (fsError) {
        logProcessingError(`Failed to read input from ${STDIN_SOURCE_PATH}: ${fsError.message}`);
        // Create an empty iterator to prevent subsequent errors in core logic
        applicationInputIterator = createInputLineIterator([]);
    }
}

/**
 * The core logic of the application to process input values and determine an XOR-based result.
 */
function executeCoreApplication() {
    const parsedInputPair = performDataConversion(retrieveNextInputLine(), 4);

    if (!parsedInputPair || parsedInputPair.length < 2) {
        logProcessingError("Insufficient input values provided. Expected two numbers for calculation.");
        return;
    }

    let firstValue = parsedInputPair[0];
    let secondValue = parsedInputPair[1];

    // Guard clause: ensure firstValue is not greater than secondValue.
    // If it is, swap them and log a warning, allowing the calculation to proceed.
    if (firstValue > secondValue) {
        logProcessingError(`Input order reversed: firstValue (${firstValue}) was greater than secondValue (${secondValue}). Swapping values.`);
        const temporaryValueHolder = firstValue;
        firstValue = secondValue;
        secondValue = temporaryValueHolder;
    }

    // Early exit for identical values, as their XOR sum is just the value itself (or 0 if A=B XOR A=B)
    if (firstValue === secondValue) {
        printApplicationResult(firstValue);
        return;
    }

    let finalXORResult;
    const isFirstValueOdd = isOddNumber(firstValue);
    const isSecondValueOdd = isOddNumber(secondValue);

    // This block calculates an XOR sum based on the parity of the input values and the interval between them.
    // The 'intervalParityFactor' represents a simplified count of terms affecting the XOR sum.
    if (isFirstValueOdd && isEvenNumber(secondValue)) {
        // Example: A=1, B=2 => (2-1-1)/2 = 0. Result: A ^ B ^ (0%2)
        // Example: A=1, B=4 => (4-1-1)/2 = 1. Result: A ^ B ^ (1%2)
        const intervalParityFactor = Math.floor((secondValue - firstValue - 1) / 2);
        finalXORResult = firstValue ^ secondValue ^ (intervalParityFactor % 2);
    } else if (isFirstValueOdd && isSecondValueOdd) {
        // Example: A=1, B=3 => (3-1)/2 = 1. Result: A ^ (1%2)
        // Example: A=1, B=5 => (5-1)/2 = 2. Result: A ^ (2%2)
        const intervalParityFactor = Math.floor((secondValue - firstValue) / 2);
        finalXORResult = firstValue ^ (intervalParityFactor % 2);
    } else if (isEvenNumber(firstValue) && isEvenNumber(secondValue)) {
        // Example: A=2, B=4 => (4-2)/2 = 1. Result: B ^ (1%2)
        // Example: A=2, B=6 => (6-2)/2 = 2. Result: B ^ (2%2)
        const intervalParityFactor = Math.floor((secondValue - firstValue) / 2);
        finalXORResult = secondValue ^ (intervalParityFactor % 2);
    } else { // isEvenNumber(firstValue) && isOddNumber(secondValue)
        // Example: A=2, B=3 => (3-2+1)/2 = 1. Result: (1%2)
        // Example: A=2, B=5 => (5-2+1)/2 = 2. Result: (2%2)
        const intervalParityFactor = Math.floor((secondValue - firstValue + 1) / 2);
        finalXORResult = intervalParityFactor % 2;
    }

    printApplicationResult(finalXORResult);
}

// --- Application Entry Point ---
initializeApplicationInput();
executeCoreApplication();
"use strict";

// This module provides a robust mechanism for consuming input data,
// typically from standard input, and parsing it into various formats.
const initializeInputProcessor = () => {
    // Acquire the raw byte stream from the standard input device.
    // Decode it as UTF-8, then segment into individual lines.
    // Handles both Windows (\r\n) and Unix (\n) line endings.
    // Filters out any blank lines that might result from trailing newlines or empty inputs.
    const sourceDataLines = require("fs").readFileSync("/dev/stdin", "utf8")
                                   .split(/\r?\n/)
                                   .filter(lineContent => lineContent.length > 0);

    // Construct a stateful object to manage the input stream's progression.
    const streamStateManager = {
        // The internal buffer holding all processed input lines.
        bufferedLines: sourceDataLines,
        // A pointer indicating the current position for the next read operation.
        readCursor: 0,
        // The total quantity of lines available in the buffer.
        totalLineCount: sourceDataLines.length,

        /**
         * Determines if there are additional lines awaiting consumption in the stream.
         * @returns {boolean} True if `readCursor` has not reached `totalLineCount`, otherwise false.
         */
        hasPendingInput: function () {
            return this.readCursor < this.totalLineCount;
        },

        /**
         * Retrieves the subsequent line from the input stream and advances the internal cursor.
         * This method is the primary way to extract data line by line.
         * @returns {string} The next available line of input.
         * @throws {Error} If an attempt is made to read past the end of the available input.
         */
        extractNextLine: function () {
            if (!this.hasPendingInput()) {
                // Employing a standard Error object for improved debuggability and error handling.
                throw new Error("Input stream depletion: No more lines available for extraction.");
            }
            // Return the line at the current cursor position, then increment the cursor.
            return this.bufferedLines[this.readCursor++];
        }
    };
    return streamStateManager;
};

// Instantiate our global input stream manager once at the application's start.
const appInputManager = initializeInputProcessor();

// Convenience function to obtain the next raw text line.
const acquireNextString = () => appInputManager.extractNextLine();

// Convenience function to parse and return the next line as an integer.
const parseNumericInput = () => {
    const rawLine = acquireNextString();
    const parsedNumber = Number(rawLine); // More explicit conversion than parseInt.
    if (isNaN(parsedNumber)) {
        // Provide a warning for non-numeric input, rather than silently failing or throwing.
        console.error(`Input Parsing Warning: "${rawLine}" could not be converted to a number.`);
    }
    return parsedNumber;
};

// Convenience function to split the next line into an array of strings based on spaces.
const tokenizeLineAsStrings = () => acquireNextString().split(" ");

// Convenience function to split and parse the next line into an array of integers.
const tokenizeLineAsNumbers = () => acquireNextString().split(" ").map(segment => Number(segment));

// Convenience function to break the next line into an array of individual characters.
const breakLineIntoChars = () => acquireNextString().split("");

// Convenience function to check if more input is globally available.
const isInputRemaining = () => appInputManager.hasPendingInput();

// Standardized output handler for program results.
const emitResult = (...outputElements) => console.log(...outputElements);

/**
 * The primary algorithm execution function.
 * This function processes a sequence of numerical pairs to calculate a cumulative adjustment.
 * The core problem involves iteratively adjusting a value such that it becomes a multiple
 * of a given divisor, working backwards through a sequence.
 */
const executeMainAlgorithm = () => {
    // The first line of input specifies the total count of subsequent data pairs.
    const numberOfEntries = parseNumericInput();

    // Initialize arrays to hold the first (primary operand) and second (divisor) values
    // for each pair. Pre-allocating arrays can sometimes offer minor performance benefits.
    const operandCollection = new Array(numberOfEntries);
    const divisorCollection = new Array(numberOfEntries);

    // Loop `numberOfEntries` times to read all the data pairs.
    // This explicit loop count ensures we read exactly the specified number of pairs,
    // which is a common pattern in competitive programming, making `numberOfEntries` definitive.
    for (let k = 0; k < numberOfEntries; k++) {
        const currentInputPair = tokenizeLineAsNumbers();
        operandCollection[k] = currentInputPair[0];
        divisorCollection[k] = currentInputPair[1];
    }

    // This variable accumulates the total adjustment required across all iterations.
    let totalCumulativeAdjustment = 0;

    // Iterate through the collected pairs in reverse order.
    // The problem's nature dictates processing from the last element towards the first.
    for (let currentElementIndex = numberOfEntries - 1; currentElementIndex >= 0; currentElementIndex--) {
        // Calculate the effective value for the current element,
        // incorporating all adjustments accumulated from subsequent elements.
        const currentEffectiveValue = operandCollection[currentElementIndex] + totalCumulativeAdjustment;
        const currentElementDivisor = divisorCollection[currentElementIndex];

        // Determine the remainder when the current effective value is divided by its divisor.
        const remainderValue = currentEffectiveValue % currentElementDivisor;

        // If the remainder is not zero, an adjustment is needed.
        // The adjustment is calculated to make (currentEffectiveValue + adjustment) a multiple
        // of currentElementDivisor. The formula (divisor - remainder) % divisor
        // elegantly handles both cases where (currentEffectiveValue % currentElementDivisor)
        // is non-zero (needs adjustment) and zero (needs zero adjustment).
        if (remainderValue !== 0) {
            totalCumulativeAdjustment += (currentElementDivisor - remainderValue);
        }
        // If remainderValue is 0, no adjustment is needed for this step,
        // so totalCumulativeAdjustment remains unchanged, which is correct.
    }

    // Output the final accumulated adjustment value.
    emitResult(totalCumulativeAdjustment);
};

// Initiate the main program flow.
executeMainAlgorithm();
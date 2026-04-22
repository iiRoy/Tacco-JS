const sourceDataLines = require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n");

/**
 * Manages sequential access to an array of string data.
 * Mimics an iterator pattern for input processing.
 */
class DataSequenceReader {
    /**
     * @private
     * @type {string[]}
     */
    dataLines;

    /**
     * @private
     * @type {number}
     */
    currentLineIdx;

    /**
     * Constructs a new DataSequenceReader.
     * @param {string[]} inputSegments - An array of strings to iterate over.
     */
    constructor(inputSegments) {
        if (!Array.isArray(inputSegments) || inputSegments.length === 0) {
            // Added validation for empty input
            throw new Error("Input data for sequence reader cannot be empty or non-array.");
        }
        this.dataLines = inputSegments;
        this.currentLineIdx = 0;
    }

    /**
     * Checks if there are more elements available in the sequence.
     * @returns {boolean} True if more elements exist, false otherwise.
     */
    canAdvance() {
        // Removed 'max' property, using direct length check.
        return this.currentLineIdx < this.dataLines.length;
    }

    /**
     * Advances the iterator and retrieves the next element.
     * @returns {string} The next string element from the sequence.
     * @throws {Error} If no more elements are available.
     */
    advanceAndRetrieve() {
        if (!this.canAdvance()) {
            // Updated error message
            throw new Error("End of sequence reached: No further elements are present for retrieval.");
        }
        const retrievedItem = this.dataLines[this.currentLineIdx];
        this.currentLineIdx++; // Increment position after retrieval
        return retrievedItem;
    }
}

// Instantiate the custom iterator.
const inputProcessor = new DataSequenceReader(sourceDataLines);

/**
 * Utility function to transform input strings based on a specified conversion type.
 * @param {string | string[]} valueToConvert - The input value to be transformed.
 * @param {number} conversionType - A numeric code indicating the desired transformation.
 *   - 1: Convert to integer (base 10).
 *   - 2: Split string by space into an array of strings.
 *   - 3: Convert to floating-point number. (New type added)
 *   - 4: Split string by space, then convert each part to an integer array.
 *   - 6: Split string into an array of individual characters.
 *   - 7: Split string into characters, then convert each to an integer array.
 * @returns {any} The converted value, or the original value if conversion fails or type is unknown.
 */
function dataConverter(valueToConvert, conversionType) {
    try {
        if (conversionType === 1) {
            // Explicitly use base 10 for integer parsing.
            return Number.parseInt(valueToConvert, 10);
        } else if (conversionType === 2) {
            return valueToConvert.split(" ");
        } else if (conversionType === 3) { // New conversion type: float
            return Number.parseFloat(valueToConvert);
        } else if (conversionType === 4) {
            return valueToConvert.split(" ").map(entry => Number.parseInt(entry, 10));
        } else if (conversionType === 6) {
            return valueToConvert.split("");
        } else if (conversionType === 7) {
            return valueToConvert.split("").map(entry => Number.parseInt(entry, 10));
        } else {
            // Default behavior: return original value if type is not recognized.
            console.warn(`Warning: Unknown conversion type (${conversionType}) for value: "${valueToConvert}". Returning original.`);
            return valueToConvert;
        }
    } catch (conversionError) {
        // Log the error but return original value for resilience.
        console.error(`Error during data conversion (type ${conversionType}) for value "${valueToConvert}": ${conversionError.message}`);
        return valueToConvert;
    }
}

/**
 * Retrieves the next raw line from the input sequence.
 * @returns {string} The next available line.
 */
function obtainNextItem() {
    return inputProcessor.advanceAndRetrieve();
}

/**
 * Checks if there are additional lines to process in the input sequence.
 * @returns {boolean} True if more lines are available, false otherwise.
 */
function hasMoreItems() {
    return inputProcessor.canAdvance();
}

/**
 * Reads the next input line and converts it to an integer.
 * @returns {number} The parsed integer.
 */
function obtainNextInteger() {
    // Using the new dataConverter function.
    return dataConverter(obtainNextItem(), 1);
}

/**
 * Reads the next input line, splits it by spaces, and converts each part to an integer.
 * @returns {number[]} An array of parsed integers.
 */
function obtainNextIntegerArray() {
    // Using the new dataConverter function.
    return dataConverter(obtainNextItem(), 4);
}

/**
 * Displays the provided content to standard output.
 * @param {any} content - The data to be printed.
 */
function outputResult(content) {
    console.log(content);
}

/**
 * Reports an error message to standard error output.
 * @param {any} errorMessage - The error content to be reported.
 */
function reportError(errorMessage) {
    console.error(errorMessage);
}

/**
 * Orchestrates the primary computational logic of the program.
 * Simulates a series of operations on two numeric operands based on an iteration count.
 */
function executeProgram() {
    // Retrieve the initial numeric parameters from the input stream.
    const initialParameters = obtainNextIntegerArray();

    // Destructure initial values for clarity.
    let firstOperand = initialParameters[0];
    let secondOperand = initialParameters[1];
    const operationCount = initialParameters[2];

    // Added a guard clause for invalid operation count.
    if (operationCount < 0) {
        reportError("Error: Operation count cannot be negative. Exiting program.");
        return; // Terminate execution if invalid.
    }

    // Main simulation loop: iterate a specified number of times.
    for (let stepIndex = 0; stepIndex < operationCount; stepIndex++) {
        const isEvenStep = (stepIndex % 2 === 0);

        if (isEvenStep) {
            // Operations for even steps, primarily affecting firstOperand.
            if (firstOperand % 2 !== 0) { // Check if firstOperand is odd
                firstOperand -= 1; // Decrement to make it even
            }
            // Calculate half of firstOperand, ensuring integer result.
            const halfFirstOperand = Math.floor(firstOperand / 2);
            secondOperand += halfFirstOperand; // Add to secondOperand
            firstOperand = halfFirstOperand;   // Update firstOperand
        } else {
            // Operations for odd steps, primarily affecting secondOperand.
            if (secondOperand % 2 !== 0) { // Check if secondOperand is odd
                secondOperand--; // Another way to decrement by 1
            }
            // Calculate half of secondOperand, ensuring integer result.
            const halfSecondOperand = Math.floor(secondOperand / 2);
            firstOperand += halfSecondOperand; // Add to firstOperand
            secondOperand = halfSecondOperand; // Update secondOperand
        }
    }

    // Output the final state of the operands using a template literal.
    outputResult(`${firstOperand} ${secondOperand}`);
}

// Invoke the main program execution routine.
executeProgram();
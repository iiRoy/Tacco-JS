'use strict'; // Enforces strict parsing and error handling for robust code execution.

/**
 * Orchestrates the primary computation logic.
 * Reads three integer values from the provided input string, performs essential validations,
 * and then calculates a specific product based on these values.
 *
 * @param {string} rawInputString - The complete string content read from the input source,
 *                                  expected to contain space-separated integer values.
 */
function ProcessInputData(rawInputString) {
    // Initialize a dedicated utility for parsing numerical data from the input stream.
    const dataStreamReader = new NumericalStreamParser(rawInputString);

    // Attempt to extract the three required numerical operands from the input.
    // Descriptive variable names are used here to enhance code clarity.
    const firstOperand = dataStreamReader.obtainNumericalValue();
    const secondOperand = dataStreamReader.obtainNumericalValue();
    const thirdOperand = dataStreamReader.obtainNumericalValue();

    // --- Core Logic: Input Validation and Early Exit Conditions ---

    // Implement a comprehensive guard clause to check for invalid or insufficient input.
    // If any operand is null (indicating parsing failure or end of stream) or if
    // there are unexpected remaining tokens, an error condition is met.
    if (firstOperand === null || secondOperand === null || thirdOperand === null || dataStreamReader.canAdvance()) {
        console.error("Error: Input processing failed. Expected exactly three valid integer values.");
        // In a production environment, this might involve throwing an exception or
        // returning a specific error code to the calling context.
        return;
    }

    // Determine if any of the three input numbers are even.
    // The problem statement defines a special outcome (zero) if this condition is met.
    // A boolean flag is introduced for improved readability and explicit state tracking.
    let atLeastOneEvenNumberFound = false;

    // Check each operand for even parity. Using 'else if' can slightly optimize
    // by avoiding unnecessary checks once an even number is identified.
    if (firstOperand % 2 === 0) {
        atLeastOneEvenNumberFound = true;
    } else if (secondOperand % 2 === 0) {
        atLeastOneEvenNumberFound = true;
    } else if (thirdOperand % 2 === 0) {
        atLeastOneEvenNumberFound = true;
    }

    // If any of the operands are even, the final result is predefined as zero.
    // This serves as an early exit, preventing further computational steps.
    if (atLeastOneEvenNumberFound) {
        // Log an informative message to the console before outputting the required '0'.
        console.info('A non-odd numerical input was detected. The resulting product is mandated to be zero.');
        console.log(0); // Output the specific required value.
        return; // Terminate function execution.
    }

    // --- Calculation for All-Odd Inputs ---
    // At this juncture, it is guaranteed that all three input operands are odd numbers.
    // The task now is to determine the product of the two smallest among them.

    // Aggregate all validated operands into a mutable array for easy sorting.
    const allValidatedOperands = [firstOperand, secondOperand, thirdOperand];

    // Sort the array of operands in ascending numerical order.
    // The sort method modifies the array in place.
    allValidatedOperands.sort((valX, valY) => valX - valY);

    // According to the re-evaluated logic, the final product is derived from
    // the two smallest values in the sorted list.
    const smallestFactor = allValidatedOperands[0];
    const secondSmallestFactor = allValidatedOperands[1];

    // Compute the final result by multiplying these two factors.
    const finalComputedProduct = smallestFactor * secondSmallestFactor;

    // Output the calculated product to the standard console.
    console.log(finalComputedProduct);
}

/**
 * A robust utility class designed to parse and extract numerical tokens
 * from a given string input. It provides methods to navigate the token stream
 * and convert tokens into integer values.
 */
class NumericalStreamParser {
    /**
     * Initializes the parser instance with the raw string data.
     * @param {string} rawDataString - The unprocessed string containing data tokens.
     */
    constructor(rawDataString) {
        /**
         * An internal buffer holding individual string tokens after initial parsing.
         * This array stores the parsed segments of the input string.
         * @private
         * @type {string[]}
         */
        this._tokenBuffer = [];

        // Validate that the input provided is indeed a string.
        if (typeof rawDataString === 'string') {
            // Pre-process the raw string: trim any leading/trailing whitespace
            // and then split it into tokens using one or more whitespace characters
            // as delimiters. This creates a clean array of data fragments.
            this._tokenBuffer = rawDataString.trim().split(/\s+/);
        } else {
            // Log a warning if unexpected input type is encountered, and initialize
            // an empty buffer to prevent runtime errors.
            console.warn("NumericalStreamParser received non-string input. Initializing with an empty token buffer.");
        }

        /**
         * The current index (position) within the `_tokenBuffer`, indicating
         * which token will be retrieved next.
         * @private
         * @type {number}
         */
        this._readPosition = 0;
    }

    /**
     * Retrieves the next available token as a raw string value.
     * This method also increments the internal read position.
     * @returns {string|null} The next token as a string, or `null` if the end
     *                          of the token stream has been reached.
     */
    retrieveNextToken() {
        if (this.canAdvance()) {
            return this._tokenBuffer[this._readPosition++];
        }
        return null; // Signals that there are no more tokens to read.
    }

    /**
     * Retrieves the next available token and attempts to parse it into an integer.
     * The internal read position is advanced after retrieval.
     * @returns {number|null} The successfully parsed integer value, or `null` if
     *                          no more tokens are available or if the token
     *                          cannot be converted into a valid integer.
     */
    obtainNumericalValue() {
        const currentToken = this.retrieveNextToken();
        if (currentToken !== null) {
            // Use `parseInt` with a radix of 10 for reliable base-10 integer conversion.
            const numericalRepresentation = parseInt(currentToken, 10);
            // Verify that the parsing operation resulted in a valid number (not NaN).
            if (!isNaN(numericalRepresentation)) {
                return numericalRepresentation;
            }
        }
        return null; // Indicates either end-of-stream or a non-numerical token.
    }

    /**
     * Checks whether there are any more tokens remaining to be read in the buffer.
     * @returns {boolean} `true` if additional tokens are available, `false` otherwise.
     */
    canAdvance() {
        return this._readPosition < this._tokenBuffer.length;
    }
}

// --- Program Entry Point for Node.js Environment ---
// This block handles reading input from standard input (e.g., '/dev/stdin')
// and initiates the primary processing logic.
try {
    // Utilize Node.js's file system module to synchronously read the content
    // of the standard input stream, ensuring it's interpreted as UTF-8 text.
    const systemInputContent = require('fs').readFileSync('/dev/stdin', 'utf8');

    // Invoke the main data processing function with the acquired input string.
    ProcessInputData(systemInputContent);
} catch (runtimeError) {
    // Catch and report any exceptions that might occur during file reading
    // or within the main program execution flow.
    console.error("An unhandled error occurred during program execution:", runtimeError.message);
    // For debugging, the full stack trace can be uncommented:
    // console.error(runtimeError.stack);
    // Exit the process with a non-zero status code to signal that an error occurred.
    process.exit(1);
}
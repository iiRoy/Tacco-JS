"use strict";

// Define the standard input file path for reading data.
const STANDARD_INPUT_SOURCE_PATH = "/dev/stdin";

/**
 * Initializes and returns an object capable of reading lines sequentially
 * from a specified file path.
 * @param {string} inputFilePath - The path to the file to read, defaults to stdin.
 * @returns {object} An object with methods to manage input lines.
 */
const prepareLineReader = (inputFilePath = STANDARD_INPUT_SOURCE_PATH) => {
    // Read the entire file, decode as UTF-8, remove any leading/trailing whitespace,
    // and then split the content into an array of individual lines.
    const allInputLines = require("fs").readFileSync(inputFilePath, "utf8").trim().split("\n");

    // Create a stateful manager for iterating through the input lines.
    const lineIteratorManager = {
        // Stores all lines read from the input source.
        storedLines: allInputLines,
        // The current position (index) from which the next line will be read.
        currentReadPosition: 0,
        // The total number of lines available for reading.
        totalLineCount: allInputLines.length,

        /**
         * Checks if there are more lines available to be read from the input.
         * @returns {boolean} True if more lines exist, false otherwise.
         */
        canRetrieveNext: function() {
            return this.currentReadPosition < this.totalLineCount;
        },

        /**
         * Retrieves the next available line from the input stream.
         * Advances the internal read position after retrieval.
         * @returns {string} The next line of input.
         * @throws {Error} If an attempt is made to read beyond the last line.
         */
        retrieveNextLine: function() {
            if (!this.canRetrieveNext()) {
                throw new Error("EndOfInputStreamException: Attempted to read past the end of the input buffer.");
            }
            // Return the line at the current position and then increment the position.
            return this.storedLines[this.currentReadPosition++];
        }
    };
    return lineIteratorManager;
};

// Global instance of our input line manager, initialized for standard input.
const primaryInputSource = prepareLineReader();

// --- Input Parsing Helper Functions ---

/**
 * Reads and returns the next full line from the input as a string.
 * @returns {string} The next input line.
 */
const fetchNextString = () => primaryInputSource.retrieveNextLine();

/**
 * Reads the next line and attempts to parse it as a base-10 integer.
 * @returns {number} The parsed integer value.
 * @throws {Error} If the line cannot be parsed into a valid integer.
 */
const readNextInteger = () => {
    const rawStringValue = primaryInputSource.retrieveNextLine();
    const parsedNumber = parseInt(rawStringValue, 10); // Explicitly use base 10.
    if (isNaN(parsedNumber)) {
        throw new Error(`DataConversionError: Cannot convert "${rawStringValue}" to an integer.`);
    }
    return parsedNumber;
};

/**
 * Reads the next line, splits it by spaces, and returns an array of strings.
 * @returns {string[]} An array of string tokens.
 */
const getSpaceDelimitedStrings = () => fetchNextString().split(" ");

/**
 * Reads the next line, splits it by spaces, and converts each token to an integer.
 * @returns {number[]} An array of parsed integer values.
 * @throws {Error} If any token cannot be parsed into a valid integer.
 */
const getSpaceDelimitedIntegers = () => {
    const stringTokens = primaryInputSource.retrieveNextLine().split(" ");
    return stringTokens.map(token => {
        const value = parseInt(token, 10);
        if (isNaN(value)) {
            throw new Error(`DataConversionError: Encountered non-integer token "${token}" in a numeric list.`);
        }
        return value;
    });
};

/**
 * Checks if there are any more lines available in the input stream.
 * @returns {boolean} True if more input is available, false otherwise.
 */
const checkInputAvailability = () => primaryInputSource.canRetrieveNext();

/**
 * A custom output function for displaying results to the console.
 * @param {...any} outputData - Data items to be logged.
 */
const printResult = (...outputData) => console.log(...outputData);

// --- Core Logic Constants and Functions ---

// Constant for the large prime modulus, represented as a BigInt.
const BIG_PRIME_MODULUS = 1000000007n;

/**
 * Computes the factorial of a given non-negative BigInt number.
 * Factorial of 0n is 1n.
 * @param {bigint} inputValue - The non-negative BigInt for which to compute the factorial.
 * @returns {bigint} The factorial of the input value.
 * @throws {Error} If the input value is negative.
 */
const computeFactorialBigInt = (inputValue) => {
    if (inputValue < 0n) {
        throw new Error("InvalidArgumentError: Factorial is undefined for negative numbers.");
    }
    if (inputValue === 0n) {
        return 1n; // Base case: 0! = 1
    }

    let accumulatedProduct = 1n;
    let currentFactor = 1n;

    // Iterate from 1 up to inputValue, multiplying each number.
    while (currentFactor <= inputValue) {
        accumulatedProduct *= currentFactor;
        currentFactor++;
    }
    return accumulatedProduct;
};

/**
 * Main function to orchestrate the program's execution flow.
 * Reads two integers, calculates a specific expression involving factorials
 * and a modulus, then prints the final result.
 */
const runMainProgram = () => {
    // Read two integer values, N and M, from a single line of input.
    const [firstNumber, secondNumber] = getSpaceDelimitedIntegers();

    // Basic validation for the input numbers. Factorials are typically for non-negative integers.
    if (firstNumber < 0 || secondNumber < 0) {
        throw new Error("InputValidationFailed: Both N and M must be non-negative for this calculation.");
    }

    // Convert standard numbers to BigInt for factorial calculation to prevent overflow.
    const bigN = BigInt(firstNumber);
    const bigM = BigInt(secondNumber);

    // Calculate factorials for N and M.
    const factorialOfN = computeFactorialBigInt(bigN);
    const factorialOfM = computeFactorialBigInt(bigM);

    // Perform the main calculation: (N! * M! * 2)
    // The '2n' ensures that the entire expression is evaluated using BigInt arithmetic.
    let intermediateCalculationResult = factorialOfN * factorialOfM * 2n;

    // Apply the modulo operation to the result.
    // This keeps the final value within a manageable range (0 to BIG_PRIME_MODULUS - 1).
    const finalModuloValue = intermediateCalculationResult % BIG_PRIME_MODULUS;

    // Convert the BigInt result back to a standard JavaScript Number for output.
    // This is safe because BIG_PRIME_MODULUS is well within Number.MAX_SAFE_INTEGER.
    printResult(Number(finalModuloValue));
};

// Initiate the execution of the main program logic.
runMainProgram();
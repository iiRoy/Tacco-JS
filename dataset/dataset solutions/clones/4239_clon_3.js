// A module for handling standard input operations.

/**
 * Initializes and returns an input reader object.
 * This object manages reading lines from standard input,
 * allowing sequential access to each line.
 * @returns {object} An object with methods to read input lines.
 */
const initializeInputReader = () => {
    // Read all input from /dev/stdin, decode as UTF-8,
    // remove leading/trailing whitespace, and split into an array of lines.
    const rawInputContent = require("fs").readFileSync("/dev/stdin", "utf8");
    const rawInputLines = rawInputContent.trim().split("\n");

    // Define the state and methods for the line reader.
    const lineReaderInstance = {
        bufferedLines: rawInputLines, // Stores all input lines.
        currentLinePointer: 0,        // Current position in the buffer.
        totalLineCount: rawInputLines.length, // Total number of lines available.

        /**
         * Checks if there are more lines available to read.
         * @returns {boolean} True if more lines exist, false otherwise.
         */
        canAdvance: function() {
            return this.currentLinePointer < this.totalLineCount;
        },

        /**
         * Retrieves the next line from the input buffer.
         * Increments the internal pointer after retrieval.
         * @returns {string} The next line of input.
         * @throws {Error} If attempting to read beyond the available lines.
         */
        retrieveNextLine: function() {
            // Ensure there are lines left to read.
            if (!this.canAdvance()) {
                // Throw a more descriptive error than a simple string.
                throw new Error("Input buffer exhausted. No more lines to retrieve.");
            }
            // Return the current line and then advance the pointer.
            return this.bufferedLines[this.currentLinePointer++];
        }
    };
    return lineReaderInstance;
};

// Create a singleton instance of the input processor for global access.
const inputProcessor = initializeInputReader();

/**
 * Gets the next raw line of input from the processor.
 * @returns {string} The next line.
 */
const getLine = () => inputProcessor.retrieveNextLine();

/**
 * Parses the next input line as an integer.
 * Includes basic validation for numeric conversion.
 * @returns {number} The parsed integer.
 * @throws {Error} If the line cannot be parsed into a valid integer.
 */
const parseNextInteger = () => {
    const line = getLine();
    const parsedValue = parseInt(line, 10); // Always specify radix for safety.
    if (isNaN(parsedValue)) {
        throw new Error(`Failed to parse "${line}" as an integer.`);
    }
    return parsedValue;
};

/**
 * Splits the next input line into an array of strings using space as a delimiter.
 * @returns {string[]} An array of string tokens.
 */
const fetchStringTokens = () => getLine().split(" ");

/**
 * Splits the next input line into an array of integers.
 * @returns {number[]} An array of integer tokens.
 * @throws {Error} If any token cannot be parsed into a valid integer.
 */
const fetchIntegerTokens = () => {
    const stringTokens = getLine().split(" ");
    // Use a helper function for robust parsing within the map.
    const convertToInteger = (str) => {
        const num = parseInt(str, 10);
        if (isNaN(num)) {
            throw new Error(`Invalid number format encountered: "${str}"`);
        }
        return num;
    };
    return stringTokens.map(convertToInteger);
};

/**
 * Splits the next input line into an array of individual characters.
 * @returns {string[]} An array of character tokens.
 */
const fetchCharacterTokens = () => getLine().split("");

/**
 * Checks if there are more lines available in the input.
 * @returns {boolean} True if more input exists, false otherwise.
 */
const hasMoreInput = () => inputProcessor.canAdvance();

/**
 * Outputs values to the console, similar to console.log.
 * Can accept multiple arguments.
 * @param {...any} data - The data to be outputted.
 */
const displayOutput = (...data) => console.log(...data);

/**
 * Calculates 2 raised to the power of a given exponent.
 * @param {number} exponent - The exponent.
 * @returns {number} The result of 2^exponent.
 * @throws {Error} If the exponent is not a valid integer.
 */
const powerOfTwo = (exponent) => {
    // Basic validation for the exponent.
    if (typeof exponent !== 'number' || !Number.isInteger(exponent)) {
        throw new Error("Exponent for powerOfTwo must be an integer.");
    }
    return 2 ** exponent; // Using ES6 exponentiation operator.
};

/**
 * Main program logic execution block.
 * Reads problem parameters, performs calculations, and outputs the result.
 */
const executeProgramLogic = () => {
    // Destructure two integer parameters from the first line of input.
    const [problemParamN, problemParamM] = fetchIntegerTokens();

    // Basic validation for input parameters.
    if (typeof problemParamN !== 'number' || typeof problemParamM !== 'number' || isNaN(problemParamN) || isNaN(problemParamM)) {
        throw new Error("Problem parameters N and M must be valid numbers.");
    }

    // Intermediate calculations for clarity and potential reuse.
    const baseCostPerM = 1900;
    const additionalProblemCount = problemParamN - problemParamM;
    const penaltyFactor = 100;
    const difficultyMultiplier = powerOfTwo(problemParamM);

    // Calculate the total cost based on the problem's formula.
    // Original formula: 1900*m + 100*(n-m)*Math.pow(2,m)
    const totalCalculatedCost = (baseCostPerM * problemParamM) +
                                (penaltyFactor * additionalProblemCount * difficultyMultiplier);

    // Display the final computed result.
    displayOutput(totalCalculatedCost);
};

// Execute the main program logic when the script runs.
executeProgramLogic();
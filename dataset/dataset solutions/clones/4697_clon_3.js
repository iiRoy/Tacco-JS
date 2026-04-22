// This module is designed to process sequential input data from a standard source
// and perform a specific numerical computation based on the first two parsed values.

/**
 * Establishes an input stream processor by reading content from a specified source.
 * It provides methods to check for available data and retrieve the next element.
 * @param {string} sourcePath - The path to the input file (e.g., /dev/stdin).
 * @returns {object} An object with methods to interact with the input stream.
 */
const establishStreamProcessor = (sourcePath = "/dev/stdin") => {
    // Utilize the Node.js file system module to read the entire file synchronously.
    const fileContentsBuffer = require("fs").readFileSync(sourcePath, "utf8");

    // Process the raw content: trim whitespace and split into individual lines.
    const processedContentLines = fileContentsBuffer.trim().split("\n");

    let currentReadPosition = 0; // Tracks the current line being pointed to.
    const totalAvailableLines = processedContentLines.length; // Total number of lines in the input.

    /**
     * Checks if there are more unread lines in the input stream.
     * @returns {boolean} True if more lines are available, false otherwise.
     */
    const verifyFurtherContent = () => currentReadPosition < totalAvailableLines;

    /**
     * Retrieves the next line from the input stream and advances the read position.
     * Throws an error if the stream has been exhausted.
     * @returns {string} The next line of input.
     * @throws {Error} If attempting to read beyond the end of the input stream.
     */
    const acquireNextContentSegment = () => {
        if (!verifyFurtherContent()) {
            console.error("Attempted to read past end of input stream.");
            // Throw a standard Error object for better error handling.
            throw new Error("InputStreamExhaustionError: No more elements available for processing.");
        }
        // Return the current line and then increment the position for the next read.
        return processedContentLines[currentReadPosition++];
    };

    // Return a structured interface for interacting with the input data.
    return {
        checkAvailability: verifyFurtherContent,
        fetchNextSegment: acquireNextContentSegment
    };
};

// Initialize the global input accessor once at application startup.
const systemInputAccessor = establishStreamProcessor();

/**
 * A robust utility function for parsing string values into integers.
 * @param {string} rawStringValue - The string to parse.
 * @returns {number} The parsed integer, or NaN if parsing fails.
 */
const parseStringAsInteger = (rawStringValue) => {
    const parsedNumber = Number.parseInt(rawStringValue, 10); // Explicitly use base 10.
    if (Number.isNaN(parsedNumber)) {
        console.warn(`Warning: Failed to convert "${rawStringValue}" into a valid integer.`);
    }
    return parsedNumber;
};

/**
 * Retrieves the next line from the input stream.
 * @returns {string} The next line as a string.
 */
const obtainNextInputLine = () => systemInputAccessor.fetchNextSegment();

/**
 * Retrieves and parses the next input line as an integer.
 * @returns {number} The parsed integer.
 */
const extractNextInteger = () => parseStringAsInteger(systemInputAccessor.fetchNextSegment());

/**
 * Retrieves the next input line, splits it by space, and returns an array of strings.
 * @returns {string[]} An array of strings from the next line.
 */
const segmentLineIntoStrings = () => systemInputAccessor.fetchNextSegment().split(" ");

/**
 * Retrieves the next input line, splits it by space, and maps each segment to an integer.
 * @returns {number[]} An array of parsed integers.
 */
const obtainIntegerSequence = () => systemInputAccessor.fetchNextSegment().split(" ").map(parseStringAsInteger);

/**
 * Checks if there are more elements in the input stream.
 * @returns {boolean} True if more elements are available, false otherwise.
 */
const verifyStreamAvailability = () => systemInputAccessor.checkAvailability();

/**
 * Displays given arguments to the console, typically for outputting results.
 * @param {...any} data - The data to be logged.
 */
const presentOutput = (...data) => console.log(...data);

/**
 * Orchestrates the primary calculation logic of the application.
 * Reads two integer inputs, performs a conditional calculation, and displays the result.
 */
const performCoreComputation = () => {
    // Attempt to read an array of integers representing the primary input values.
    const initialInputPair = obtainIntegerSequence();

    // Implement a guard clause for input validation.
    if (!initialInputPair || initialInputPair.length < 2 || initialInputPair.some(isNaN)) {
        presentOutput("Error: Insufficient or invalid numerical input provided. Expected at least two integers.");
        return; // Exit if input is not valid.
    }

    // Assign input values to descriptively named variables.
    const firstNumericalQuantity = initialInputPair[0]; // Corresponds to 'n'
    const secondNumericalQuantity = initialInputPair[1]; // Corresponds to 'm'

    // Introduce an intermediate variable for a common sub-expression to enhance readability.
    const twiceFirstQuantity = 2 * firstNumericalQuantity;

    let computedFinalResult; // Variable to store the outcome of the calculation.

    // Rephrase the conditional calculation using an explicit if-else block
    // and introduce temporary variables for divisors for clarity.
    if (secondNumericalQuantity <= twiceFirstQuantity) {
        // Case 1: Second quantity is less than or equal to twice the first.
        const divisorForFirstCase = 2;
        computedFinalResult = Math.floor(secondNumericalQuantity / divisorForFirstCase);
    } else {
        // Case 2: Second quantity is greater than twice the first.
        const combinedQuantitiesSum = twiceFirstQuantity + secondNumericalQuantity;
        const divisorForSecondCase = 4;
        computedFinalResult = Math.floor(combinedQuantitiesSum / divisorForSecondCase);
    }

    // Output the final calculated result.
    presentOutput(computedFinalResult);
};

// Initiate the main application logic.
performCoreComputation();
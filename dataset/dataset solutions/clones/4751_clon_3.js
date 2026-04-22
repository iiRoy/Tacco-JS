"use strict";

/**
 * Establishes a system for reading input lines from the standard input stream.
 * It encapsulates the raw input into an iterable-like object.
 * @returns {object} An object with methods to access input lines sequentially.
 * @throws {Error} If there is a problem reading the input source.
 */
const buildLineIterator = () => {
    let rawInputContent;
    try {
        // Attempt to read the entire standard input content as a UTF-8 string.
        rawInputContent = require("fs").readFileSync("/dev/stdin", "utf8").trim();
    } catch (readError) {
        // Log the error and throw a more specific exception for clarity.
        console.error("Input stream acquisition failed:", readError.message);
        throw new Error("Failed to initialize input stream: " + readError.message);
    }

    // Split the content into an array of individual lines.
    const contentLines = rawInputContent.split("\n");

    // This object manages the state and provides methods for input consumption.
    const inputHandler = {
        sourceArray: contentLines, // The array holding all input lines.
        readPosition: 0,           // Current pointer indicating the next line to read.
        totalLinesAvailable: contentLines.length, // Total number of lines in the input.

        /**
         * Checks if there are more unread lines in the input stream.
         * @returns {boolean} True if more lines are available, false otherwise.
         */
        hasMoreData: function () {
            return this.readPosition < this.totalLinesAvailable;
        },

        /**
         * Retrieves the next available line from the input stream.
         * @returns {string} The next line of input.
         * @throws {Error} If an attempt is made to read beyond the end of the input.
         */
        retrieveNextLine: function () {
            if (!this.hasMoreData()) {
                // Provide a clear error message for out-of-bounds access.
                throw new Error("End of input reached. No more lines to process.");
            }
            const currentDataLine = this.sourceArray[this.readPosition];
            this.readPosition++; // Advance the pointer for the next read.
            return currentDataLine;
        }
    };
    return inputHandler;
};

// Instantiate the global input reader for the application.
const globalInputReader = buildLineIterator();

/**
 * Proxies the input reader's method to get the next raw line.
 * @returns {string} The next line from input.
 */
const fetchNextRawLine = () => globalInputReader.retrieveNextLine();

/**
 * Parses the next input line as an integer value.
 * Includes explicit type conversion and basic validation.
 * @returns {number} The parsed integer.
 * @throws {Error} If the input line cannot be converted to a valid integer.
 */
const parseNextInteger = () => {
    const rawLine = globalInputReader.retrieveNextLine();
    const numericalValue = Number(rawLine); // Explicitly convert to number.
    if (isNaN(numericalValue) || !Number.isInteger(numericalValue)) {
        // Validate if the parsed value is indeed an integer.
        throw new Error(`Invalid integer format encountered: "${rawLine}"`);
    }
    return numericalValue;
};

/**
 * Reads the next input line and splits it into an array of strings (words).
 * @returns {string[]} An array of strings.
 */
const extractWordsArray = () => globalInputReader.retrieveNextLine().split(" ");

/**
 * Reads the next input line, splits it, and parses each part into an integer.
 * Non-finite numbers (e.g., NaN) are filtered out.
 * @returns {number[]} An array of parsed integers.
 */
const extractIntegerArray = () => {
    const lineParts = globalInputReader.retrieveNextLine().split(" ");
    // Map each part to a number and filter out any non-numeric results.
    return lineParts.map(str => Number(str)).filter(Number.isFinite);
};

/**
 * Reads the next input line and splits it into an array of individual characters.
 * @returns {string[]} An array of characters.
 */
const extractCharacterArray = () => globalInputReader.retrieveNextLine().split("");

/**
 * Checks if there are any remaining lines in the input stream.
 * @returns {boolean} True if more input is available, false otherwise.
 */
const checkMoreInputAvailable = () => globalInputReader.hasMoreData();

/**
 * Outputs one or more values to the console, prefixed for identification.
 * @param {...any} itemsToLog - The items to be displayed.
 */
const displayOutput = (...itemsToLog) => {
    console.log("[RESULT]:", ...itemsToLog); // Add a distinctive prefix.
};

/**
 * Contains the primary business logic for the problem.
 * It reads input, performs calculations based on specific rules, and outputs the final result.
 */
const executeProblemSolver = () => {

    // Read the initial count of operations or elements.
    let totalElementsCount = parseNextInteger();

    // Implement a guard clause for non-positive input count.
    if (totalElementsCount <= 0) {
        displayOutput("Warning: Number of elements is non-positive. No processing required.");
        return; // Exit early if no operations are specified.
    }

    // Arrays to store two sets of numerical data.
    const firstDataSet = [];
    const secondDataSet = [];

    // Continuously read data pairs until the input stream is exhausted.
    while (checkMoreInputAvailable()) {
        const currentDataPair = extractIntegerArray();

        // Validate the structure and content of each data pair.
        if (currentDataPair.length !== 2 || !currentDataPair.every(val => Number.isFinite(val))) {
            console.warn(`Skipping malformed input line: "${globalInputReader.sourceArray[globalInputReader.readPosition - 1]}". Expected two finite numbers.`);
            continue; // Move to the next input line if current one is invalid.
        }
        firstDataSet.push(currentDataPair[0]);
        secondDataSet.push(currentDataPair[1]);
    }

    // Initialize a variable to accumulate the total required adjustments.
    let accumulatedAdjustment = 0;

    // Iterate through the data sets in reverse order, applying adjustments.
    for (let reverseIdx = totalElementsCount - 1; reverseIdx >= 0; reverseIdx--) {

        // Calculate the current value, considering previous adjustments.
        let currentCombinedValue = firstDataSet[reverseIdx] + accumulatedAdjustment;
        const currentDivisor = secondDataSet[reverseIdx]; // Use a temp variable for divisor.

        // Determine if an adjustment is necessary to make currentCombinedValue a multiple of currentDivisor.
        if (currentCombinedValue % currentDivisor === 0) {
            // If already a multiple, no adjustment needed for this step.
            // Explicit 'continue' for flow clarity.
            continue;
        } else {
            // Calculate the remainder after division.
            const currentRemainder = currentCombinedValue % currentDivisor;
            // Calculate how much needs to be added to reach the next multiple.
            const requiredAddition = currentDivisor - currentRemainder;
            // Apply this addition to the accumulated adjustment.
            accumulatedAdjustment += requiredAddition;
        }
        // Original code had a line 'tmp += p[i];' here.
        // As 'p' was an array of zeros, this line was functionally inert.
        // It has been removed as part of Type III simplification, assuming it was a remnant or bug.
    }

    // The final answer is the total accumulated adjustment.
    // The original code's 'p' array and its reduction were misleading
    // as 'p' contained only zeros, always resulting in 0.
    // This revision assumes 'cnt' (now 'accumulatedAdjustment') was the intended result.
    const finalCalculatedResult = accumulatedAdjustment;

    // Display the computed final result.
    displayOutput(finalCalculatedResult);
};

// Initiate the execution of the problem-solving logic.
executeProblemSolver();
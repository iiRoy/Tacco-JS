"use strict";

// A factory function to set up the input stream handler.
// This replaces the original 'create' function, providing a more structured approach.
class DataLineIterator {
    // Internal storage for the lines read from input.
    #sourceData;
    // Current position within the input lines.
    #currentPosition;
    // Total number of lines available.
    #totalLines;

    /**
     * Constructs a new DataLineIterator.
     * @param {string[]} rawLines An array of strings, where each string is a line of input.
     */
    constructor(rawLines) {
        this.#sourceData = rawLines;
        this.#currentPosition = 0;
        this.#totalLines = rawLines.length;
    }

    /**
     * Checks if there are more lines available to be processed.
     * @returns {boolean} True if there's a next element, false otherwise.
     */
    hasMoreElements() {
        return this.#currentPosition < this.#totalLines;
    }

    /**
     * Retrieves the next line from the input stream.
     * Throws an error if no more elements are available.
     * @returns {string} The next line of input.
     * @throws {RangeError} If the end of the input stream has been reached.
     */
    retrieveNextElement() {
        if (!this.hasMoreElements()) {
            throw new RangeError("InputBoundsExceeded: Attempted to read past the end of the data stream.");
        }
        // Retrieve the current line and then advance the position.
        const currentLine = this.#sourceData[this.#currentPosition];
        this.#currentPosition += 1;
        return currentLine;
    }
}

/**
 * Establishes and returns an input stream processor.
 * This function handles reading from standard input.
 * @returns {DataLineIterator} An instance of DataLineIterator ready to provide input.
 */
const establishInputSource = () => {
    // Access the file system module.
    const filesystemModule = require("fs");

    // Read all raw content from standard input synchronously.
    const rawInputContent = filesystemModule.readFileSync("/dev/stdin", "utf8");

    // Trim leading/trailing whitespace from the entire input.
    const cleanedInput = rawInputContent.trim();

    // Split the cleaned input into an array of individual lines.
    const individualLines = cleanedInput.split("\n");

    // Add a validation step for empty or non-existent input.
    if (individualLines.length === 0 || (individualLines.length === 1 && individualLines[0] === '')) {
        console.warn("Warning: No meaningful input lines detected. Initializing input iterator with empty data.");
        return new DataLineIterator([]); // Return an iterator for an empty array.
    }

    return new DataLineIterator(individualLines);
};

// Initialize the global input stream handler.
const inputReaderInstance = establishInputSource();

// --- Utility functions for parsing various input formats ---

/**
 * Retrieves the next raw string line from the input.
 * @returns {string} The next line.
 */
const getNextLine = () => inputReaderInstance.retrieveNextElement();

/**
 * Retrieves the next line and parses it as an integer.
 * @returns {number} The parsed integer.
 * @throws {TypeError} If the line cannot be parsed as an integer.
 */
const getNextInteger = () => {
    const lineContent = inputReaderInstance.retrieveNextElement();
    const parsedValue = parseInt(lineContent, 10);
    // Add robustness: check if parsing was successful.
    if (isNaN(parsedValue)) {
        throw new TypeError(`Invalid integer format encountered: "${lineContent}"`);
    }
    return parsedValue;
};

/**
 * Retrieves the next line and splits it into an array of strings by space.
 * @returns {string[]} An array of strings.
 */
const getNextStringArray = () => {
    const lineContent = inputReaderInstance.retrieveNextElement();
    return lineContent.split(" ");
};

/**
 * Retrieves the next line, splits it by space, and parses each part into an integer.
 * Uses a traditional loop for iteration instead of 'map' for structural variation.
 * @returns {number[]} An array of integers.
 */
const getNextIntegerArray = () => {
    const stringElements = inputReaderInstance.retrieveNextElement().split(" ");
    const integerElements = [];
    for (const strEl of stringElements) {
        const num = parseInt(strEl, 10);
        // Optional: warn or handle non-integer elements within the array.
        if (isNaN(num) && strEl.trim() !== '') { // Ignore empty strings from split
            console.warn(`Non-integer array element found: "${strEl}". It will be represented as NaN.`);
        }
        integerElements.push(num);
    }
    return integerElements;
};

/**
 * Retrieves the next line and converts it into an array of characters.
 * @returns {string[]} An array of characters.
 */
const getNextCharacterArray = () => {
    const lineContent = inputReaderInstance.retrieveNextElement();
    return Array.from(lineContent); // Using Array.from for diversity.
};

/**
 * Checks if there is more input available.
 * @returns {boolean} True if more input exists, false otherwise.
 */
const checkMoreInput = () => inputReaderInstance.hasMoreElements();

// --- Output utility function ---

/**
 * Formats and displays output to the console.
 * Adds a prefix for clarity.
 * @param {...any} dataItems The items to be logged.
 */
const outputFormatter = (...dataItems) => {
    console.log("Calculated Result:", ...dataItems);
};

// --- Core Calculation Logic ---

/**
 * Determines the number of times an initial value must be doubled
 * until it becomes equal to or exceeds a specified threshold.
 * (Note: The original 'calc' function had `while(n>k)` which would lead to an infinite loop
 * or incorrect results for common problem interpretations. This implementation
 * assumes the more typical competitive programming intent of `while(n < k)`
 * to count doublings until the value meets or exceeds the threshold.)
 *
 * @param {number} initialValue The starting value.
 * @param {number} targetThreshold The target value to reach or exceed.
 * @returns {number} The count of doublings. Returns Infinity for impossible cases.
 */
const calculateMultiplierFactor = (initialValue, targetThreshold) => {
    let doublingIterations = 0;
    let currentWorkingValue = initialValue;

    // Guard clause: If initial value is already at or above threshold, no doublings needed.
    if (currentWorkingValue >= targetThreshold) {
        return 0;
    }

    // Guard clause: Handle non-positive target threshold or initial value that cannot reach a positive threshold.
    if (targetThreshold <= 0) {
        // If target is non-positive, and current is positive, it implicitly 'exceeds' it.
        if (initialValue > 0) return 0;
        // If both are non-positive, 0 doublings.
        return 0;
    }
    if (initialValue <= 0) {
        // If initial is non-positive but target is positive, it can never reach by doubling.
        return Infinity;
    }

    // Loop to count doublings until the current value is no longer strictly less than the threshold.
    while (currentWorkingValue < targetThreshold) {
        currentWorkingValue *= 2;
        doublingIterations++;
    }

    return doublingIterations;
};

// --- Main Program Execution ---

/**
 * Contains the primary logic for solving the problem.
 * This is the entry point for the problem's solution.
 */
const executePrimaryLogic = () => {
    // Read the two integer parameters, N and K, from the first line of input.
    const inputParameters = getNextIntegerArray();
    const N_val = inputParameters[0];
    const K_val = inputParameters[1];

    // Add validation for input parameters.
    if (N_val === undefined || K_val === undefined || N_val <= 0 || K_val <= 0) {
        console.error("Error: Input for N and K must be two positive integers.");
        return; // Terminate execution for invalid input.
    }

    let finalAccumulatedProbability = 0.0; // Initialize result as a floating-point number.
    const probabilityBase = 0.5; // Define the base probability as a constant.

    // Loop through each value from 1 to N_val (inclusive).
    for (let currentIterationValue = 1; currentIterationValue <= N_val; currentIterationValue++) {
        // Calculate the number of doublings required for the current value 'i' to reach 'K'.
        const requiredDoublings = calculateMultiplierFactor(currentIterationValue, K_val);

        // Calculate the probability associated with this number of doublings.
        // Rewritten 0.5**cnt to use Math.pow for clarity and an intermediate variable.
        const probabilityComponent = Math.pow(probabilityBase, requiredDoublings);

        // Accumulate the weighted probability for the current iteration.
        // Ensure explicit floating-point division for 1.0 / N_val.
        finalAccumulatedProbability += (1.0 / N_val) * probabilityComponent;
    }

    // Display the final computed result using the custom output formatter.
    outputFormatter(finalAccumulatedProbability);
};

// Initiate the main program logic.
executePrimaryLogic();
"use strict";

/**
 * Initializes and returns an input processing utility.
 * This component is responsible for reading data from standard input line by line.
 * It encapsulates the file system operations and provides an iterable interface.
 * @returns {object} An object containing methods for input stream management.
 */
const initializeInputProcessor = () => {
    // Acquire the 'fs' module to handle file system operations.
    const fileSystem = require("fs");

    // Read the entire content of standard input, convert to UTF-8,
    // remove any surrounding whitespace, and then segment into an array of lines.
    const rawInputLines = fileSystem.readFileSync("/dev/stdin", { encoding: "utf8" }).trim().split("\n");

    // Construct the core input stream object with its state and behavior.
    const streamHandler = {
        // The internal buffer where all input lines are stored.
        inputBuffer: rawInputLines,
        // Tracks the current line index being processed within the buffer.
        currentLinePointer: 0,
        // Stores the total count of lines available in the input buffer.
        totalLineCount: rawInputLines.length,

        /**
         * Determines if there are additional lines available for consumption.
         * This acts as a guard to prevent reading beyond the end of the input.
         * @returns {boolean} True if more lines exist, false otherwise.
         */
        hasMoreData: function () {
            // Compare the current reading pointer against the total number of lines.
            return this.currentLinePointer < this.totalLineCount;
        },

        /**
         * Extracts and returns the next sequential line from the input buffer.
         * Increments the internal line pointer after a successful read.
         * @returns {string} The next available line as a string.
         * @throws {Error} If an attempt is made to read past the end of the input buffer.
         */
        retrieveNextLine: function () {
            // Pre-check: Ensure there's data to retrieve before proceeding.
            if (!this.hasMoreData()) {
                // Throw a specific error to indicate an out-of-bounds access.
                throw new Error("InputBufferUnderflowException: Attempted to read beyond the available input lines.");
            }
            // Fetch the line at the current pointer position.
            const lineContent = this.inputBuffer[this.currentLinePointer];
            // Advance the pointer to the next line for subsequent calls.
            this.currentLinePointer++;
            return lineContent;
        },

        /**
         * (Type III Addition)
         * Provides a mechanism to reset the input stream's reading position back to the beginning.
         * This is a non-essential utility added for demonstrating Type III changes.
         */
        resetStream: function() {
            this.currentLinePointer = 0;
            // A non-critical log to indicate this operation occurred.
            console.warn("Input stream position has been reset to the start.");
        }
    };
    return streamHandler;
};

// Instantiate the global input stream object once at the start of the script.
// All subsequent input operations will leverage this single instance.
const globalInputSource = initializeInputProcessor();

// Collection of utility functions to simplify common input parsing patterns.

/**
 * Retrieves the next line from the input stream as a raw string.
 * @returns {string} The raw string content of the next line.
 */
const fetchStringValue = () => globalInputSource.retrieveNextLine();

/**
 * Parses the next input line into an integer.
 * Utilizes the `Number()` constructor for robust type conversion.
 * @returns {number} The integer representation of the next line.
 */
const parseNextInteger = () => Number(globalInputSource.retrieveNextLine());

/**
 * Reads the next line, then splits it into an array of strings using space as a delimiter.
 * @returns {string[]} An array of substrings.
 */
const getSpaceSeparatedStrings = () => globalInputSource.retrieveNextLine().split(" ");

/**
 * Reads the next line, splits it by spaces, and converts each resulting substring into an integer.
 * @returns {number[]} An array of integers.
 */
const getSpaceSeparatedIntegers = () => globalInputSource.retrieveNextLine().split(" ").map(Number);

/**
 * Reads the next line and breaks it down into an array of individual characters.
 * @returns {string[]} An array where each element is a single character.
 */
const getIndividualCharacters = () => globalInputSource.retrieveNextLine().split("");

/**
 * Checks if the input stream still has unread lines.
 * @returns {boolean} True if there's more input, false otherwise.
 */
const checkDataAvailability = () => globalInputSource.hasMoreData();

/**
 * (Type III Addition)
 * Reads the next line and attempts to parse it as a floating-point number.
 * @returns {number} The floating-point representation of the next line.
 */
const parseNextFloat = () => parseFloat(globalInputSource.retrieveNextLine());

/**
 * Custom function for displaying output to the console.
 * This abstraction allows for easier modification of output behavior if needed.
 * @param {...any} itemsToLog - Any number of arguments to be logged.
 */
const emitResult = (...itemsToLog) => console.log(...itemsToLog);

/**
 * The core logic of the application.
 * This function reads two integers from the input and performs a specific calculation
 * based on their values and relative positions on the number line.
 */
const executeMainLogic = () => {
    // Read the two primary numerical inputs from a single line.
    const [firstOperand, secondOperand] = getSpaceSeparatedIntegers();

    // Calculate an initial base value for the total operations.
    // This represents the absolute difference between their absolute magnitudes.
    let totalOperationsCount = Math.abs(Math.abs(firstOperand) - Math.abs(secondOperand));

    // Introduce boolean flags to clarify the conditional logic.
    // Flag 1: Do the two numbers have opposite signs (including one being zero but not both)?
    const areOnOppositeSidesIncludingZero = (firstOperand * secondOperand <= 0 && (firstOperand !== 0 || secondOperand !== 0));
    // Flag 2: Is the first number strictly greater than the second number?
    const isFirstValueLarger = (firstOperand > secondOperand);

    // Apply the first adjustment to the operation count.
    // This condition is met if the numbers span across or touch the zero point
    // in a way that implies a 'crossing-zero' type of operation.
    if (areOnOppositeSidesIncludingZero) {
        totalOperationsCount += 1;
    }
    // Apply the second adjustment. This 'else if' ensures this condition is
    // only evaluated if the first condition was false (i.e., numbers are on the same side of zero,
    // or both are zero, and the first value is greater).
    // This specific scenario (same sign, first value greater) incurs an additional cost.
    else if (isFirstValueLarger) {
        totalOperationsCount += 2;
    }

    // Output the final computed result to the console.
    emitResult(totalOperationsCount);
};

// Begin the execution of the main application logic.
executeMainLogic();
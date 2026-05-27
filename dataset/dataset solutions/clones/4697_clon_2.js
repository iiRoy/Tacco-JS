"use strict";

/**
 * Sets up an input stream handler to process lines from standard input.
 * @returns {object} An object providing methods to navigate and retrieve input data.
 */
const initializeInputProcessor = () => {
    // Acquire raw input from the standard input stream, decode it, clean up, and segment into lines.
    const rawInputLines = require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n");

    // Construct the core input processing entity.
    const processorInstance = {
        dataSegments: rawInputLines, // Stores all the individual lines read from input.
        currentSegmentIndex: 0,      // Tracks the current position within the dataSegments array.
        totalSegments: rawInputLines.length, // The total count of available input lines.

        /**
         * Determines if there are additional input segments awaiting processing.
         * @returns {boolean} Returns true if more segments are present; otherwise, false.
         */
        hasMoreSegments: function () {
            return this.currentSegmentIndex < this.totalSegments;
        },

        /**
         * Retrieves the subsequent input segment and advances the internal pointer.
         * An error is raised if no further segments are accessible.
         * @returns {string} The next available input line.
         */
        retrieveNextSegment: function () {
            if (!this.hasMoreSegments()) {
                throw "ArrayIndexOutOfBoundsException"; // Signal that the end of input has been reached.
            } else {
                return this.dataSegments[this.currentSegmentIndex++]; // Fetch current segment, then increment index.
            }
        }
    };
    return processorInstance; // Deliver the fully configured input processor.
};

// Instantiate the global input handler for application-wide use.
const inputHandler = initializeInputProcessor();

// Utility functions to simplify common input parsing patterns.
const fetchNextLine = () => inputHandler.retrieveNextSegment();
const fetchNextInteger = () => parseInt(inputHandler.retrieveNextSegment());
const fetchNextStringArray = () => inputHandler.retrieveNextSegment().split(" ");
const fetchNextIntegerArray = () => inputHandler.retrieveNextSegment().split(" ").map(currentElement => parseInt(currentElement));
const fetchNextCharacterArray = () => inputHandler.retrieveNextSegment().split("");
const checkIfMoreAvailable = () => inputHandler.hasMoreSegments();

// A standardized function for printing output to the console.
const outputToConsole = (...itemsToPrint) => console.log(...itemsToPrint);

/**
 * Encapsulates the primary computational and logical flow of the application.
 * It reads necessary input, performs calculations, and then displays the outcome.
 */
const executeMainLogic = () => {
    // Extract two integer values from the input stream.
    const [valueN, valueM] = fetchNextIntegerArray();

    // Compute the final answer based on a conditional expression.
    // IMPORTANT: The identifier 'M' in the first branch is preserved as-is from the original code.
    // If 'M' is not globally defined, this will result in a ReferenceError, replicating original behavior.
    let finalCalculatedAnswer = valueM <= 2 * valueN
        ? Math.floor(M / 2) // This 'M' is intentionally left as-is to match original behavior.
        : Math.floor((2 * valueN + valueM) / 4);

    // Present the computed result to the user.
    outputToConsole(finalCalculatedAnswer);
};

// Initiate the execution of the main program logic.
executeMainLogic();

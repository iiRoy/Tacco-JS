"use strict";

/**
 * Establishes and returns an object designed for reading input data.
 * This object manages the collection of input lines, tracks the current reading position,
 * and offers methods to verify the availability of more input and to retrieve the subsequent line.
 * @returns {object} An input handling utility.
 */
const initializeInputReader = () => {
    // Reads all content from standard input, decodes it as UTF-8, removes leading/trailing whitespace,
    // and then divides it into an array of individual lines.
    const rawInputLines = require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n");

    // Constructs the primary input handler object.
    const inputSourceHandler = {
        "dataLines": rawInputLines, // The array holding all processed input lines.
        "currentLineIndex": 0,      // An internal pointer indicating the line currently being accessed.
        "totalLineCount": rawInputLines.length, // The total number of lines available for reading.

        /**
         * Determines if there are additional lines remaining to be read.
         * @returns {boolean} Returns true if more lines are present, otherwise false.
         */
        "hasMoreLines": function() {
            return this.currentLineIndex < this.totalLineCount;
        },

        /**
         * Retrieves the next available line from the input sequence.
         * If no more lines are available, it will throw an error.
         * @returns {string} The subsequent line of input.
         */
        "fetchNextLine": function() {
            if (!this.hasMoreLines()) {
                // This specific error message string is critical and must remain unchanged.
                throw "ArrayIndexOutOfBoundsException";
            } else {
                // Returns the line at the current index and then increments the index for the next call.
                return this.dataLines[this.currentLineIndex++];
            }
        }
    };
    return inputSourceHandler;
};

// Instantiates the global input handler for use throughout the script.
const globalInputHandler = initializeInputReader();

// A collection of utility functions to simplify input parsing.

/**
 * Fetches the next raw line of input as a string.
 * @returns {string} The next complete line.
 */
const retrieveNextLine = () => globalInputHandler.fetchNextLine();

/**
 * Parses the next input line into an integer value.
 * @returns {number} The parsed integer.
 */
const parseNextInteger = () => parseInt(globalInputHandler.fetchNextLine());

/**
 * Retrieves the next input line and segments it into an array of strings, using spaces as delimiters.
 * @returns {string[]} An array containing string tokens.
 */
const retrieveNextStringArray = () => globalInputHandler.fetchNextLine().split(" ");

/**
 * Retrieves the next input line, splits it by spaces, and converts each resulting part into an integer.
 * @returns {number[]} An array of integer values.
 */
const parseNextIntegerArray = () => globalInputHandler.fetchNextLine().split(" ").map(elementValue => parseInt(elementValue));

/**
 * Retrieves the next input line and breaks it down into an array of individual characters.
 * @returns {string[]} An array of single-character strings.
 */
const retrieveNextCharacterArray = () => globalInputHandler.fetchNextLine().split("");

/**
 * Verifies if there is additional input data available for processing.
 * @returns {boolean} True if more input exists, false otherwise.
 */
const checkMoreInput = () => globalInputHandler.hasMoreLines();

/**
 * Serves as the primary function for logging output to the console.
 * @param {...any} args - Any number of arguments to be printed.
 */
const outputToConsole = (...args) => console.log(...args);

/**
 * Implements the core simulation logic.
 * This function utilizes a breadth-first search (BFS) like approach
 * to determine the minimum number of time steps required to reach a specific target coordinate.
 */
const runSimulation = () => {
    // Reads the target coordinate value from the input.
    const targetCoordinate = parseNextInteger();

    let simulationTime = 0; // Initializes a counter for the elapsed simulation time.
    let coordinateQueue = [0]; // Initializes a queue with the starting position at 0.

    // Continues the simulation loop as long as there are positions in the queue to explore.
    while (coordinateQueue.length > 0) {
        simulationTime++; // Increments the time for each new level of exploration in the BFS.
        let queueCurrentSize = coordinateQueue.length; // Captures the current size of the queue for this level.

        // Processes all elements that were present in the queue at the start of this time step.
        for (let i = 0; i < queueCurrentSize; i++) {
            let currentCoordinate = coordinateQueue.shift(); // Removes the next position from the front of the queue.

            // Checks if the target coordinate can be reached from the current position
            // by moving 'simulationTime' units in either the positive or negative direction.
            if (currentCoordinate - simulationTime === targetCoordinate || currentCoordinate + simulationTime === targetCoordinate) {
                outputToConsole(simulationTime); // Prints the time if the target is successfully reached.
                return; // Exits the function immediately as the minimum time has been found.
            }

            // Adds new potential positions to the queue for the subsequent time step.
            // These represent moving 'simulationTime' units from 'currentCoordinate' in various ways.
            coordinateQueue.push(currentCoordinate - simulationTime); // Move left
            coordinateQueue.push(currentCoordinate + simulationTime); // Move right
            coordinateQueue.push(currentCoordinate); // Stay at the current coordinate (relative to the next time step's moves)
        }
    }
};

// Initiates the main simulation process.
runSimulation();

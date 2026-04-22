// Strict mode for cleaner code practices, ensuring variables are declared.
"use strict";

/**
 * Establishes an input service to read data from a specified source.
 * This function returns a closure that acts as an iterator over the input lines.
 * @param {string} sourcePath - The path to the input file, defaults to /dev/stdin.
 * @returns {object} An object with methods to access input data.
 */
const establishInputService = (sourcePath = "/dev/stdin") => {
    // Dynamically import the 'fs' module for file system operations.
    const _fileSystemModule = require("fs");

    // Read the entire file content, decode as UTF-8, trim whitespace, and split into lines.
    const rawInputLines = _fileSystemModule.readFileSync(sourcePath, "utf8").trim().split("\n");

    let currentReadPointer = 0; // Tracks the current line being read.
    const totalLineCount = rawInputLines.length; // Total number of lines available.

    /**
     * Helper function to check if there are more lines to read.
     * @returns {boolean} True if more lines are available, false otherwise.
     */
    const hasMoreContent = () => {
        return currentReadPointer < totalLineCount;
    };

    /**
     * Helper function to retrieve the next line from the input.
     * Advances the read pointer after retrieval.
     * @returns {string} The next line of input.
     * @throws {Error} If attempting to read beyond the end of the input stream.
     */
    const retrieveNextLine = () => {
        if (!hasMoreContent()) {
            throw new Error("Input stream exhausted: No more lines to read.");
        }
        // Return the current line and then increment the pointer for the next call.
        return rawInputLines[currentReadPointer++];
    };

    // The public interface of our input service.
    return {
        // Expose only the necessary methods, keeping internal state private.
        hasMoreElements: hasMoreContent,
        fetchNextElement: retrieveNextLine
    };
};

// Initialize the global input data handler.
const dataHandler = establishInputService();

// --- Convenience functions for input parsing ---

/**
 * Fetches the next raw line from the input.
 * @returns {string} The next line as a string.
 */
const getNextLine = () => dataHandler.fetchNextElement();

/**
 * Parses the next input line as an integer.
 * @returns {number} The parsed integer value.
 * @throws {Error} If the parsed value is not a valid integer.
 */
const readInteger = () => {
    const value = parseInt(dataHandler.fetchNextElement(), 10);
    if (Number.isNaN(value)) {
        throw new Error("Invalid input: Expected an integer but received non-numeric data.");
    }
    return value;
};

/**
 * Splits the next input line into an array of strings using space as a delimiter.
 * @returns {string[]} An array of string tokens.
 */
const readLineTokens = () => dataHandler.fetchNextElement().split(" ");

/**
 * Splits the next input line, parses each part as an integer, and returns an array.
 * @returns {number[]} An array of integer tokens.
 * @throws {Error} If any part cannot be parsed as a valid integer.
 */
const readIntegerTokens = () => {
    return dataHandler.fetchNextElement().split(" ").map(segment => {
        const num = parseInt(segment, 10);
        if (Number.isNaN(num)) {
             throw new Error(`Invalid input: Expected integer token but received "${segment}".`);
        }
        return num;
    });
};

/**
 * Splits the next input line into an array of individual characters.
 * @returns {string[]} An array of characters.
 */
const getCharacterArray = () => dataHandler.fetchNextElement().split("");

/**
 * Checks if there are more elements available in the input stream.
 * @returns {boolean} True if more input is available, false otherwise.
 */
const hasPendingInput = () => dataHandler.hasMoreElements();

/**
 * A utility function for displaying results to the console.
 * Uses spread syntax to handle multiple arguments gracefully.
 */
const logResult = (...itemsToDisplay) => {
    console.log(...itemsToDisplay);
};

/**
 * The main execution logic for the problem.
 * This function simulates a breadth-first search (BFS) to find the minimum steps
 * to reach a target position from an initial position of 0,
 * where each step allows movement left by `time`, right by `time`, or staying put.
 */
const executeSolver = () => {
    // Read the target position from the input.
    const desiredPosition = readInteger();

    // Input validation: Ensure the target is a finite number.
    if (!Number.isFinite(desiredPosition)) {
        throw new Error("Target position must be a finite number.");
    }

    let elapsedSteps = 0; // Represents the current 'time' or number of steps taken.
    // The processing queue stores potential locations to explore.
    // Starts with the initial position 0.
    let processingQueue = [0];

    // Continue the search as long as there are locations to explore.
    while (processingQueue.length > 0) {
        // Increment the step count for the current level of the BFS.
        elapsedSteps++;

        // Store the size of the queue at the beginning of this level.
        // This ensures we process only the nodes from the current level before adding new ones.
        const currentBatchSize = processingQueue.length;

        // Process all locations at the current 'elapsedSteps' level.
        for (let i = 0; i < currentBatchSize; i++) {
            // Retrieve the next location from the front of the queue.
            const currentLocation = processingQueue.shift();

            // Calculate potential new locations based on current time (elapsedSteps).
            const nextLocationLeft = currentLocation - elapsedSteps;
            const nextLocationRight = currentLocation + elapsedSteps;
            const nextLocationStay = currentLocation; // Option to stay at the current location.

            // Check if either of the new potential locations matches the desired target.
            if (nextLocationLeft === desiredPosition || nextLocationRight === desiredPosition) {
                // If target reached, log the current elapsed steps and terminate.
                logResult(elapsedSteps);
                return; // Exit the function as the solution is found.
            }

            // Add the new potential locations to the queue for the next iteration.
            // These will be processed in the subsequent 'elapsedSteps' level.
            processingQueue.push(nextLocationLeft);
            processingQueue.push(nextLocationRight);
            processingQueue.push(nextLocationStay); // Re-add the current location for future steps.
        }
    }
    // If the loop finishes without finding the target, it implies the target is unreachable.
    // For this specific problem, it's expected to always find a path.
};

// Execute the main problem-solving function.
executeSolver();
"use strict";

/**
 * --- Input Stream Handler Module ---
 * This module provides a mechanism to read data from standard input
 * on a line-by-line basis, treating each line as a distinct segment.
 * It offers sequential access and type conversion utilities.
 */

// A private utility function to safely convert a string value to an integer.
// It uses Number() for broader type conversion and checks for NaN,
// ensuring the result is an integer using Math.floor.
const safeIntegerParser = (valueToParse) => {
    const numericValue = Number(valueToParse);
    if (isNaN(numericValue)) {
        // In a real-world scenario, one might throw an error here.
        // For competitive programming, input is often guaranteed valid.
        console.error(`Input Parsing Warning: Could not parse '${valueToParse}' as a number. Defaulting to 0.`);
        return 0;
    }
    return Math.floor(numericValue); // Ensure it's an integer.
};

// Function responsible for creating and configuring an input data stream object.
const initializeDataStream = () => {
    // Lazily load the 'fs' (file system) module.
    const fileSystemAPI = require("fs");

    // Read the entire content of stdin, decode it as UTF-8,
    // remove any leading/trailing whitespace, and then split it into an array of lines.
    const sourceDataLines = fileSystemAPI.readFileSync("/dev/stdin", "utf8").trim().split("\n");

    // Internal state variables for the stream's position.
    let currentReadIndex = 0;
    const totalDataSegments = sourceDataLines.length;

    // The stream object itself, containing methods for interaction.
    const dataAccessInterface = {
        // Internal array holding all the input lines.
        inputSegments: sourceDataLines,

        // Method to check if there are any remaining data segments to read.
        hasMoreSegments: function() {
            return currentReadIndex < totalDataSegments;
        },

        // Method to retrieve the next data segment and advance the internal pointer.
        // Throws an error if an attempt is made to read beyond the end of the stream.
        fetchNextSegment: function() {
            // Validate if there's data before attempting to retrieve it.
            if (!this.hasMoreSegments()) {
                throw new Error("DataStreamDepletionException: No more input segments available to retrieve.");
            }
            // Return the current segment and then increment the index.
            return this.inputSegments[currentReadIndex++];
        }
    };
    return dataAccessInterface;
};

// Instantiate the primary input stream reader for global access.
const mainInputSource = initializeDataStream();

// --- Helper functions for convenient input reading ---

// Reads the next available line as a raw string.
const acquireNextString = () => mainInputSource.fetchNextSegment();

// Reads the next line and converts it into an integer using our safe parser.
const acquireNextInteger = () => safeIntegerParser(mainInputSource.fetchNextSegment());

// Reads the next line, splits it by space, and returns an array of strings (tokens).
const acquireStringTokens = () => mainInputSource.fetchNextSegment().split(" ");

// Reads the next line, splits it by space, and converts each token into an integer.
const acquireIntegerTokens = () => {
    const rawTokenLine = mainInputSource.fetchNextSegment();
    return rawTokenLine.split(" ").map(token => safeIntegerParser(token));
};

// A direct check for whether more input is available.
const checkRemainingInput = () => mainInputSource.hasMoreSegments();

// --- Output utility ---
// A versatile function for logging output to the console.
const logProgramOutput = (...outputElements) => {
    console.log(...outputElements);
};

/**
 * --- Primary Application Logic ---
 * This function encapsulates the core problem-solving algorithm.
 */
const executeMainAlgorithm = () => {
    // Read two integer values from the input stream.
    // Assuming they are provided on a single line separated by a space.
    const [valA, valB] = acquireIntegerTokens();

    // --- Input Validation ---
    // Basic check to ensure valid numeric inputs were received.
    if (typeof valA !== 'number' || isNaN(valA) || typeof valB !== 'number' || isNaN(valB)) {
        logProgramOutput("Error: Invalid numeric input provided. Expected two integers.");
        return; // Terminate execution if input is invalid.
    }

    // A local reference to the absolute value function for conciseness.
    const absFunction = Math.abs;

    // Initialize the result with the absolute difference of their absolute values.
    let finalCalculatedResult = absFunction(absFunction(valA) - absFunction(valB));

    // --- Conditional Adjustments to the Result ---

    // Scenario 1: If the two input values have opposite signs.
    // This is true if their product is negative.
    const areNumbersOppositeSigned = (valA * valB < 0);
    if (areNumbersOppositeSigned) {
        finalCalculatedResult += 1;
    }
    // Scenario 2: Specific edge cases involving zero.
    // Either (valA is positive and valB is zero) OR (valA is zero and valB is negative).
    else if ((valA > 0 && valB === 0) || (valA === 0 && valB < 0)) {
        finalCalculatedResult += 1;
    }
    // Scenario 3: If the first value is strictly less than the second value.
    // This condition is evaluated if the previous conditions were false.
    else if (valA < valB) {
        finalCalculatedResult += 2;
    }
    // An optional 'else' block could be added here for other conditions
    // or as a default case, but for this specific problem, the above
    // conditions cover all necessary modifications to the result.

    // Output the final computed result to the console.
    logProgramOutput(finalCalculatedResult);
};

// Begin program execution by calling the main algorithm function.
executeMainAlgorithm();
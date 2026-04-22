"use strict";

/**
 * Processes a raw input string containing four space-separated integers,
 * calculates the length of the intersection of two intervals defined by these integers,
 * and prints the result to the console.
 *
 * The input represents two intervals: [firstIntervalStart, firstIntervalEnd] and
 * [secondIntervalStart, secondIntervalEnd].
 *
 * @param {string} problemDataString - The raw string input from the problem source.
 */
const processInputAndCalculateOverlap = (problemDataString) => {
    // --- Input Validation and Pre-processing (Added fragments) ---
    // Guard clause: Check if the input data string is empty or just whitespace.
    if (!problemDataString || problemDataString.trim().length === 0) {
        console.error("Error: Provided input data is empty or consists only of whitespace.");
        // In a real application, one might throw an error or return a specific error code.
        return; // Exit the function as no valid data to process.
    }

    // Split the trimmed input string into its individual components.
    const stringComponents = problemDataString.trim().split(' ');

    // Guard clause: Ensure the input contains exactly four components.
    if (stringComponents.length !== 4) {
        console.error(`Error: Expected four numerical components, but received ${stringComponents.length}.`);
        return;
    }

    // --- Data Parsing and Type Conversion (Renamed and slightly updated) ---
    // Convert string components to numeric values. Using Number() for slight variation from parseInt.
    const numericValues = stringComponents.map(component => {
        const parsedNumber = Number(component); // Attempt to convert string to number.
        // Guard clause: Check if the parsed value is a valid number.
        if (isNaN(parsedNumber)) {
            console.error(`Error: Invalid numeric value detected in input: "${component}".`);
            return 0; // Default to 0 or handle error more robustly.
        }
        return parsedNumber;
    });

    // --- Extracting Interval Boundaries (Renamed variables) ---
    // Assign the parsed numeric values to clearly named variables representing interval boundaries.
    const firstIntervalStart = numericValues[0];  // Corresponds to original 'A'
    const firstIntervalEnd = numericValues[1];    // Corresponds to original 'B'
    const secondIntervalStart = numericValues[2]; // Corresponds to original 'C'
    const secondIntervalEnd = numericValues[3];   // Corresponds to original 'D'

    // --- Core Overlap Calculation Logic (Renamed and simplified/updated) ---
    // Determine the starting point of the potential intersection. This is the maximum of the two start points.
    const intersectionLeftBoundary = Math.max(firstIntervalStart, secondIntervalStart);
    // Determine the ending point of the potential intersection. This is the minimum of the two end points.
    const intersectionRightBoundary = Math.min(firstIntervalEnd, secondIntervalEnd);

    // Calculate the raw difference between the intersection boundaries.
    // This value could be negative if the intervals do not overlap.
    const rawOverlapDifference = intersectionRightBoundary - intersectionLeftBoundary;

    // The actual length of the overlap cannot be negative. If the raw difference is negative,
    // it means there is no overlap, so the length is 0.
    // This single line replaces the original 'if/else if' block (Type III: deletion + update).
    const finalOverlapLength = Math.max(0, rawOverlapDifference);

    // --- Output Result ---
    // Display the calculated length of the overlapping segment.
    console.log(finalOverlapLength);
};

/**
 * Main execution entry point for the problem solution.
 * Reads input from standard input and delegates to the processing function.
 */
const initiateSolutionExecution = () => {
    try {
        // Read all content from the standard input file synchronously.
        // The 'utf8' encoding is specified to handle text data correctly.
        const fileSystemInput = require('fs').readFileSync('/dev/stdin', 'utf8');
        // Pass the acquired input string to the primary processing function.
        processInputAndCalculateOverlap(fileSystemInput);
    } catch (error) {
        // Handle any potential errors during file reading (e.g., file not found).
        console.error("An error occurred while reading input:", error.message);
    }
};

// Invoke the main execution function to start the problem-solving process.
initiateSolutionExecution();
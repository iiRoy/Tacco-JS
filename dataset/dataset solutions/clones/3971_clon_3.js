"use strict";

/**
 * @class DataParser
 * @description Utility class for parsing input data from a string, token by token.
 *              It provides methods to extract numerical and string values sequentially.
 */
class DataParser {
    /**
     * @private
     * @type {number}
     * @description Tracks the current index within the array of parsed tokens,
     *              indicating the next token to be consumed.
     */
    #currentPosition = 0;

    /**
     * @private
     * @type {string[]}
     * @description An array containing all individual string tokens extracted from the raw input data.
     */
    #parsedTokens;

    /**
     * Constructs a new DataParser instance.
     * @param {string} sourceData - The raw string content to be parsed. This is typically read from standard input.
     * @throws {Error} If the provided `sourceData` is not a string or is undefined.
     */
    constructor(sourceData) {
        // Validate input type for robustness.
        if (typeof sourceData !== 'string') {
            throw new Error('Input source data must be a string and cannot be omitted!');
        }
        // Split the input string into tokens using newlines or spaces as delimiters.
        // Filter out any empty strings that might result from multiple consecutive delimiters.
        this.#parsedTokens = sourceData.split(/\n|\s/).filter(token => token.length > 0);
    }

    /**
     * Retrieves and parses the next available token as an integer.
     * Advances the internal pointer to the next token.
     * @returns {number} The integer value of the next token.
     * @throws {Error} If there are no more tokens to read or if the token cannot be parsed as an integer.
     */
    getNextInteger() {
        // Ensure there are tokens remaining to be read.
        if (this.#currentPosition >= this.#parsedTokens.length) {
            throw new Error('Attempted to read past the end of available input tokens.');
        }
        // Extract the next token and increment the position.
        const token = this.#parsedTokens[this.#currentPosition++];
        // Convert the token to an integer using base 10.
        const numericalValue = parseInt(token, 10);

        // Added validation: Check if the parsing was successful.
        if (isNaN(numericalValue)) {
            throw new Error(`Invalid number format encountered: '${token}'. Expected an integer.`);
        }
        return numericalValue;
    }

    /**
     * Retrieves the next available token as a raw string.
     * Advances the internal pointer to the next token.
     * @returns {string} The string value of the next token.
     * @throws {Error} If there are no more tokens to read.
     */
    getNextString() {
        // Ensure there are tokens remaining.
        if (this.#currentPosition >= this.#parsedTokens.length) {
            throw new Error('Attempted to read past the end of available input tokens.');
        }
        return this.#parsedTokens[this.#currentPosition++];
    }
}

/**
 * @typedef {object} CoordinatePoint
 * @property {number} x - The X-coordinate of the point.
 * @property {number} y - The Y-coordinate of the point.
 * @property {boolean} available - A flag indicating whether this point is still available for matching.
 */

/**
 * Implements a greedy algorithm to find the maximum number of matching pairs
 * between two sets of 2D points (red and blue). A red point R(x_r, y_r)
 * can be matched with a blue point B(x_b, y_b) if x_r < x_b and y_r < y_b.
 * The algorithm sorts both sets of points and then iterates through the red points,
 * attempting to match each with the first available blue point that satisfies the criteria.
 *
 * @param {string} inputStringContent - The complete raw input string, typically read from stdin,
 *                                      containing the number of points and their coordinates.
 */
function ProcessCoordinates(inputStringContent) {
    // Instantiate the data parser to extract numerical values from the input.
    let dataReader = new DataParser(inputStringContent);

    // Read the total number of red and blue points from the input.
    let pointCount = dataReader.getNextInteger();

    // Guard clause: If there are no points to process, immediately output 0 and exit.
    if (pointCount <= 0) {
        console.log(0);
        return;
    }

    /** @type {CoordinatePoint[]} */
    let redPoints = []; // Array to store red coordinate points.
    /** @type {CoordinatePoint[]} */
    let bluePoints = []; // Array to store blue coordinate points.

    // Populate the `redPoints` array by reading x and y coordinates.
    // Each point is stored as an object with x, y, and an 'available' status.
    for (let currentIdx = 0; currentIdx < pointCount; currentIdx++) {
        redPoints.push({
            x: dataReader.getNextInteger(),
            y: dataReader.getNextInteger(),
            available: true // All points start as available.
        });
    }

    // Populate the `bluePoints` array similarly.
    for (let currentIdx = 0; currentIdx < pointCount; currentIdx++) {
        bluePoints.push({
            x: dataReader.getNextInteger(),
            y: dataReader.getNextInteger(),
            available: true // All points start as available.
        });
    }

    /**
     * A comparison function used for sorting `CoordinatePoint` objects.
     * It prioritizes sorting by the X-coordinate in ascending order.
     * If X-coordinates are equal, it then sorts by the Y-coordinate in ascending order.
     * @param {CoordinatePoint} coordA - The first point for comparison.
     * @param {CoordinatePoint} coordB - The second point for comparison.
     * @returns {number} A standard comparison result (-1, 0, or 1).
     */
    const coordinateSorter = (coordA, coordB) => {
        // Primary sort key: X-coordinate.
        if (coordA.x !== coordB.x) {
            return coordA.x - coordB.x;
        }
        // Secondary sort key: Y-coordinate (if X-coordinates are identical).
        return coordA.y - coordB.y;
    };

    // Sort both the red and blue point arrays using the defined comparison function.
    // This sorting is crucial for the greedy matching strategy to work correctly.
    redPoints.sort(coordinateSorter);
    bluePoints.sort(coordinateSorter);

    // Initialize a counter for the number of successful matches found.
    let totalMatchedPairs = 0;

    // Begin the main matching loop. Iterate through each red point.
    for (let redIdx = 0; redIdx < pointCount; redIdx++) {
        const currentRedPoint = redPoints[redIdx]; // Reference to the current red point object.

        // Inner loop: Iterate through the blue points to find a match for the current red point.
        for (let blueIdx = 0; blueIdx < pointCount; blueIdx++) {
            const currentBluePoint = bluePoints[blueIdx]; // Reference to the current blue point object.

            // Skip this blue point if it has already been matched with another red point.
            // This replaces the `B[b] == undefined` check from the original code.
            if (!currentBluePoint.available) {
                continue;
            }

            // Check the matching conditions: red point's X must be less than blue's X,
            // and red point's Y must be less than blue's Y.
            if (currentRedPoint.x < currentBluePoint.x && currentRedPoint.y < currentBluePoint.y) {
                // A valid match has been found!
                // Mark the blue point as unavailable so it cannot be used again.
                currentBluePoint.available = false; // This is an update from `B[b] = undefined;`.
                totalMatchedPairs++; // Increment the global counter.

                // Since this red point has now been successfully matched,
                // we can stop searching for a blue point for it and move to the next red point.
                // The original code's `R[r] = undefined;` was effectively handled by this `break`
                // and the outer loop's progression to the next `r`.
                break;
            }
        }
    }

    // Output the final count of unique red-blue pairs found.
    console.log(totalMatchedPairs);
}

// Environment-specific execution block.
// This ensures the code runs correctly when executed via Node.js (e.g., from a terminal)
// by reading input from standard input, and avoids execution in browser environments.
if (typeof window === "undefined") {
    // Dynamically import the 'fs' (file system) module, available in Node.js.
    const fileSystem = require("fs");
    // Read the entire content of the standard input stream synchronously.
    // '/dev/stdin' is a common path for standard input in Unix-like systems.
    const stdinContent = fileSystem.readFileSync("/dev/stdin", "utf8");
    // Invoke the main processing function with the captured input.
    ProcessCoordinates(stdinContent);
}
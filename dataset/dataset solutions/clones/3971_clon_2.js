"use strict";

// Primary function to process the input data
function ProcessData(rawData) {
    // Initialize a data parser instance
    let parserInstance = new DataParser(rawData);

    // Read the total number of points
    let count = parserInstance.fetchInteger();

    // Create arrays to store red and blue points
    let redPoints = new Array(count);
    let bluePoints = new Array(count);

    // Populate the red points array
    for (let idxR = 0; idxR < count; idxR++) {
        redPoints[idxR] = [parserInstance.fetchInteger(), parserInstance.fetchInteger()];
    }

    // Populate the blue points array
    for (let idxB = 0; idxB < count; idxB++) {
        bluePoints[idxB] = [parserInstance.fetchInteger(), parserInstance.fetchInteger()];
    }

    // Define a comparison function for sorting coordinates
    const coordinateSorter = (coordA, coordB) => {
        // Sort primarily by the first coordinate, then by the second
        return coordA[0] === coordB[0] ? coordA[1] - coordB[1] : coordA[0] - coordB[0];
    };

    // Sort both red and blue points using the defined sorter
    redPoints.sort(coordinateSorter);
    bluePoints.sort(coordinateSorter);

    // Variable to store the total number of matched pairs
    let matchedPairs = 0;

    // Iterate through each red point
    for (let idxR = 0; idxR < count; idxR++) {
        // Skip if the red point has already been matched (marked as undefined)
        if (redPoints[idxR] === undefined) {
            continue;
        }

        // Iterate through each blue point
        for (let idxB = 0; idxB < count; idxB++) {
            // Skip if the blue point has already been matched
            if (bluePoints[idxB] === undefined) {
                continue;
            }

            // Check if the current red point can be paired with the current blue point
            // A red point (x1, y1) can be paired with a blue point (x2, y2) if x1 < x2 and y1 < y2
            if (redPoints[idxR][0] < bluePoints[idxB][0] && redPoints[idxR][1] < bluePoints[idxB][1]) {
                // Mark both points as used by setting them to undefined
                bluePoints[idxB] = undefined;
                redPoints[idxR] = undefined;
                // Increment the count of successful pairings
                matchedPairs++;
                // Move to the next red point as this one has found a match
                break;
            }
        }
    }

    // Output the final count of matched pairs
    console.log(matchedPairs);
}

// Helper class for parsing input data
class DataParser {
    // Constructor takes the raw input string
    constructor(sourceText) {
        if (typeof sourceText === 'undefined') {
            throw new Error('引数（stdin）を省略できません！'); // Error message for missing input
        }
        this.currentIdx = 0; // Current index for token retrieval
        // Split the input string by newlines or spaces to get individual tokens
        this.parsedTokens = sourceText.split(/\n|\s/);
    }

    // Fetches the next integer from the parsed tokens
    fetchInteger() {
        return this.parsedTokens[this.currentIdx++] - 0; // Convert string to number
    }

    // Fetches an array of integers of a specified length
    fetchIntegerArray(numElements) {
        if (typeof numElements === 'undefined') {
            throw new Error('引数（1以上）を省略できません！'); // Error message for missing length
        }
        let resultArray = new Array(numElements);
        for (let elementIdx = 0; elementIdx < numElements; elementIdx++) {
            resultArray[elementIdx] = this.fetchInteger();
        }
        return resultArray;
    }

    // Fetches the next string token
    fetchString() {
        return this.parsedTokens[this.currentIdx++];
    }

    // Fetches an array of string tokens of a specified length
    fetchStringArray(numElements) {
        if (typeof numElements === 'undefined') {
            throw new Error('引数（1以上）を省略できません！'); // Error message for missing length
        }
        let resultArray = new Array(numElements);
        for (let elementIdx = 0; elementIdx < numElements; elementIdx++) {
            resultArray[elementIdx] = this.fetchString();
        }
        return resultArray;
    }
}

// Entry point for execution, handles environment differences (browser vs. Node.js)
if (typeof window === "undefined") {
    // If not in a browser environment (likely Node.js), read from stdin
    ProcessData(require("fs").readFileSync("/dev/stdin", "utf8"));
}

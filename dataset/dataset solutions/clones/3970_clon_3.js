const executeMatchingAlgorithm = (inputDataBlock) => {
    // Validate input: if the data block is null, undefined, or just empty space, exit gracefully.
    if (!inputDataBlock || inputDataBlock.trim().length === 0) {
        // In a real application, this might throw an error or log a message.
        // For competitive programming, often simply leads to an implicit error or crash.
        return;
    }

    // Break down the entire input into an array of individual lines.
    const inputLinesArray = inputDataBlock.split('\n');

    // Utility function to convert a string line into an array of two numeric coordinates.
    // This encapsulates the parsing logic and enhances readability.
    const extractCoordinates = (lineText) => {
        // Using `Number` constructor is often preferred over `parseInt` for consistency
        // when dealing with array mapping, as it handles empty strings as 0 or NaN depending on context.
        return lineText.split(' ').map(Number);
    };

    // The first line indicates the total number of coordinate pairs (N).
    // Ensure it's treated as a number.
    const numberOfPairs = Number(inputLinesArray[0]);

    // If the number of pairs is invalid (e.g., zero or non-numeric), there's nothing to process.
    if (isNaN(numberOfPairs) || numberOfPairs <= 0) {
        console.log(0); // Output zero matches as per problem constraints for no data.
        return;
    }

    // Initialize two distinct collections for our coordinate points.
    // 'Source' points (formerly 'a') and 'Target' points (formerly 'c').
    let sourcePointsCollection = [];
    let targetPointsCollection = [];

    // Populate the 'source' points collection from the input lines.
    // These correspond to lines 1 through N (indices 1 to N in a 0-indexed array).
    for (let currentLineIndex = 0; currentLineIndex < numberOfPairs; currentLineIndex++) {
        sourcePointsCollection.push(extractCoordinates(inputLinesArray[currentLineIndex + 1]));
    }

    // Populate the 'target' points collection.
    // These correspond to lines N+1 through 2N (indices N+1 to 2N in a 0-indexed array).
    for (let currentLineIndex = 0; currentLineIndex < numberOfPairs; currentLineIndex++) {
        targetPointsCollection.push(extractCoordinates(inputLinesArray[currentLineIndex + numberOfPairs + 1]));
    }

    // --- Sorting Strategy ---
    // The specific sorting order is critical for the greedy algorithm's correctness.

    // Sort the 'source' points:
    // Primary sort by X-coordinate in ascending order.
    // Secondary sort by Y-coordinate in ascending order (for points with identical X-coordinates).
    sourcePointsCollection.sort((coordA, coordB) => {
        if (coordA[0] !== coordB[0]) {
            return coordA[0] - coordB[0]; // Sort by X ascending
        }
        return coordA[1] - coordB[1]; // Then by Y ascending
    });

    // Sort the 'target' points:
    // Primary sort by X-coordinate in ascending order.
    // Secondary sort by Y-coordinate in descending order (for points with identical X-coordinates).
    targetPointsCollection.sort((coordA, coordB) => {
        if (coordA[0] !== coordB[0]) {
            return coordA[0] - coordB[0]; // Sort by X ascending
        }
        return coordB[1] - coordA[1]; // Then by Y descending
    });

    // --- Core Matching Logic ---
    let totalSuccessfulMatches = 0; // Counter for matched pairs.

    // Iterate through the 'source' points starting from the end (largest X, largest Y).
    // This specific reverse iteration is a key part of the greedy approach.
    for (let currentSourceIndex = numberOfPairs - 1; currentSourceIndex >= 0; currentSourceIndex--) {
        const currentSourcePoint = sourcePointsCollection[currentSourceIndex]; // Cache the current point.

        // Early exit: if no more target points are available, stop trying to match.
        if (targetPointsCollection.length === 0) {
            break;
        }

        // Iterate through the 'target' points, also starting from the end (largest X, smallest Y).
        // The length of 'targetPointsCollection' can change during the loop due to `splice`.
        for (let currentTargetIndex = targetPointsCollection.length - 1; currentTargetIndex >= 0; currentTargetIndex--) {
            const currentTargetPoint = targetPointsCollection[currentTargetIndex]; // Cache the current point.

            // Check the matching condition: a source point (x_s, y_s) matches a target point (x_t, y_t)
            // if x_s < x_t AND y_s < y_t.
            if (currentSourcePoint[0] < currentTargetPoint[0] && currentSourcePoint[1] < currentTargetPoint[1]) {
                totalSuccessfulMatches++; // Increment the counter for a successful match.

                // Remove the matched target point from the collection.
                // This prevents it from being matched again. `splice` modifies the array in place.
                targetPointsCollection.splice(currentTargetIndex, 1);

                // Once a match is found for the current source point, we move to the next source point.
                // This is the greedy choice: find *any* valid match and move on.
                break;
            }
        }
    }

    // Output the final count of successful matches.
    console.log(totalSuccessfulMatches);
};

// --- Application Entry Point ---
// This immediately-invoked function expression (IIFE) handles reading input
// and initiating the main algorithm.
(function initializeAndRun() {
    // Use Node.js's file system module to read from standard input.
    // This is common in competitive programming environments.
    const fileSystemModule = require("fs");
    const rawDataFromFile = fileSystemModule.readFileSync("/dev/stdin", "utf8");

    // Trim any leading or trailing whitespace from the raw input string.
    const cleanedInputForProcessing = rawDataFromFile.trim();

    // Invoke the main algorithm with the prepared input data.
    executeMatchingAlgorithm(cleanedInputForProcessing);
})();
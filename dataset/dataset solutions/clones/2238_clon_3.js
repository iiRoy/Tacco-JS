"use strict";

/**
 * Orchestrates the processing of input data to determine the maximum number
 * of non-overlapping intervals. This function acts as the primary entry point
 * for the scheduling problem.
 * @param {string} rawInputString - The complete input data as a single string,
 *                                  typically read from a file or standard input.
 */
function processSchedulingProblem(rawInputString) {
    // Validate the incoming raw data string.
    if (typeof rawInputString !== 'string' || rawInputString.trim().length === 0) {
        console.error("Error: Input data is empty or invalid.");
        return;
    }

    // Split the input string into individual lines, handling various line ending types.
    // The first line is typically a count, subsequent lines define entities.
    const allInputLines = rawInputString.split(/\r?\n/);

    // The first line often contains a count, but it might not be strictly necessary
    // for processing if we can infer the count from the actual data lines.
    // For Type III, we can demonstrate removal of unused variables.
    // const totalEntityCount = parseInt(allInputLines[0], 10);
    // if (isNaN(totalEntityCount)) {
    //     console.error("Error: Could not parse total entity count from the first line.");
    //     return;
    // }

    // Extract the lines that describe the entities, skipping the header line.
    const entityDescriptionLines = allInputLines.slice(1).filter(line => line.trim() !== '');

    // If there are no entity description lines, there's nothing to process.
    if (entityDescriptionLines.length === 0) {
        console.log(0); // No entities means no possible non-overlapping intervals.
        return;
    }

    // Transform entity descriptions into interval representations.
    // Each entity is defined by a position (x) and a length/duration (d).
    // It can be represented as an interval [x - d, x + d].
    const computedIntervals = [];
    for (const currentEntityLine of entityDescriptionLines) {
        const parts = currentEntityLine.split(' ');
        if (parts.length !== 2) {
            console.warn(`Warning: Skipping malformed line: "${currentEntityLine}"`);
            continue;
        }

        const startCoordinate = parseInt(parts[0], 10);
        const durationValue = parseInt(parts[1], 10);

        if (isNaN(startCoordinate) || isNaN(durationValue)) {
            console.warn(`Warning: Skipping line with non-numeric values: "${currentEntityLine}"`);
            continue;
        }

        // Calculate the effective start and end points of the interval.
        const intervalLowerBound = startCoordinate - durationValue;
        const intervalUpperBound = startCoordinate + durationValue;
        computedIntervals.push([intervalLowerBound, intervalUpperBound]);
    }

    // Sort the intervals based on their end points in ascending order.
    // This is a crucial step for the greedy algorithm to work correctly.
    computedIntervals.sort((intervalA, intervalB) => {
        // Compare by the upper bound (index 1).
        // If upper bounds are equal, secondary sort by lower bound (index 0) is often
        // done for stability, though not strictly required for this specific problem.
        if (intervalA[1] !== intervalB[1]) {
            return intervalA[1] - intervalB[1];
        }
        return intervalA[0] - intervalB[0]; // Secondary sort by start time
    });

    // Initialize variables for the greedy selection process.
    // `lastAcceptedEndpoint` tracks the end point of the most recently selected interval.
    // `disjointIntervalCounter` counts the total number of non-overlapping intervals found.
    let lastAcceptedEndpoint = Number.MIN_SAFE_INTEGER; // Initialize with a very small number to ensure the first interval is always selected.
    let disjointIntervalCounter = 0;

    // Iterate through the sorted intervals to find the maximum number of non-overlapping ones.
    for (const currentInterval of computedIntervals) {
        const currentIntervalStart = currentInterval[0];
        const currentIntervalEnd = currentInterval[1];

        // If the current interval's start time is greater than or equal to
        // the end time of the last accepted interval, it means they don't overlap.
        if (currentIntervalStart >= lastAcceptedEndpoint) {
            // Select this interval.
            disjointIntervalCounter++;
            // Update the `lastAcceptedEndpoint` to the end of the current interval.
            lastAcceptedEndpoint = currentIntervalEnd;
        }
    }

    // Output the final count of non-overlapping intervals.
    console.log(disjointIntervalCounter);
}

// Entry point for execution: Read from standard input and pass to the main processing function.
// This part is typically environment-specific (e.g., Node.js for competitive programming).
const systemInputContent = require("fs").readFileSync("/dev/stdin", "utf8");
processSchedulingProblem(systemInputContent);
"use strict";

// This script processes train schedule data to find the maximum number of
// concurrently operating trains based on a specific, unique overlap definition.
// Input is read from standard input, with each block starting with the count
// of train intervals to follow. A count of 0 terminates the program.

// --- Configuration Constants ---
const FILE_SYSTEM_MODULE = require('fs');
const STANDARD_INPUT_PATH = '/dev/stdin';
const BASE_DATE_FOR_PARSING = '2000-01-01'; // A fixed date used to convert time strings to comparable timestamps.

// --- Helper Functions ---

/**
 * Converts a time string (e.g., "09:00", "17:45") into a numerical timestamp
 * representing milliseconds since the Unix epoch for a fixed base date.
 * This allows for direct numerical comparison of times within a day.
 *
 * @param {string} timeString - The time string to convert.
 * @returns {number} The timestamp in milliseconds, or NaN if parsing fails.
 */
const convertTimeToMs = (timeString) => {
    // We construct a full date string to ensure Date object creation is consistent.
    // .getTime() returns the number of milliseconds since January 1, 1970, 00:00:00 UTC.
    return new Date(`${BASE_DATE_FOR_PARSING} ${timeString}`).getTime();
};

/**
 * Implements the specific interval overlap detection logic as defined by the original problem statement.
 * This is crucial because it's NOT a standard mathematical interval overlap check.
 *
 * The original code's 'else' branch (where an overlap is registered) corresponds to the condition:
 * `!(intervalA[1] <= intervalB[0] || intervalB[0] <= intervalA[0])`
 * This simplifies to `intervalA[1] > intervalB[0] && intervalB[0] > intervalA[0]`.
 * In plain English: Interval A must end strictly after Interval B begins, AND
 * Interval B must begin strictly after Interval A begins.
 * This means Interval B must start *within* Interval A's duration (excluding A's start point).
 *
 * @param {Array<number>} intervalA - The first interval, represented as [startTimeMs, endTimeMs].
 * @param {Array<number>} intervalB - The second interval, represented as [startTimeMs, endTimeMs].
 * @returns {boolean} True if the specific overlap condition between intervalA and intervalB is met.
 */
const checkSpecificOverlapCondition = (intervalA, intervalB) => {
    const startOfA = intervalA[0];
    const endOfA = intervalA[1];
    const startOfB = intervalB[0];
    // The precise condition derived from the original code's 'else' block for overlap.
    return endOfA > startOfB && startOfB > startOfA;
};

// --- Main Program Logic ---

let rawInputContent;
try {
    // Read the entire content of the standard input file synchronously.
    // Using 'utf8' encoding ensures proper character handling.
    rawInputContent = FILE_SYSTEM_MODULE.readFileSync(STANDARD_INPUT_PATH, 'utf8');
} catch (ioError) {
    // If reading fails, log an error and exit the process.
    console.error(`ERROR: Could not read from standard input (${STANDARD_INPUT_PATH}). Details: ${ioError.message}`);
    process.exit(1); // Indicate an error occurred.
}

// Split the raw input into an array of lines.
// .trim() removes leading/trailing whitespace (like a final newline).
// .filter(Boolean) removes any empty strings that result from splitting,
// ensuring we only process lines with actual content.
let inputDataLines = rawInputContent.trim().split('\n').filter(Boolean);

let currentInputLine; // This variable will hold the line currently being processed.

// The main loop processes blocks of train data. Each block begins with a number
// indicating how many train intervals follow. A '0' indicates the end of input.
while ((currentInputLine = inputDataLines.shift()) !== undefined) {
    // Skip any lines that are empty or contain only whitespace, even after initial filtering.
    if (currentInputLine.trim() === '') {
        continue;
    }

    // Attempt to parse the first line of a block as the count of intervals.
    const expectedIntervalCount = Number.parseInt(currentInputLine, 10);

    // If the count is 0, it's the termination signal.
    if (expectedIntervalCount === 0) {
        break; // Exit the main processing loop.
    }

    // --- Input Validation for Expected Interval Count ---
    if (isNaN(expectedIntervalCount) || expectedIntervalCount < 0) {
        console.warn(`WARNING: Encountered an invalid or negative interval count "${currentInputLine}". Skipping this block.`);
        // To maintain input stream integrity, consume the number of lines
        // that *would* have been train intervals if the count was valid.
        for (let discardCounter = 0; discardCounter < expectedIntervalCount; ++discardCounter) {
            inputDataLines.shift(); // Discard the next line.
        }
        continue; // Move to the next block of data.
    }

    // An array to hold the parsed [startTimeMs, endTimeMs] pairs for the current block.
    let currentBlockIntervals = [];

    // Read and parse the specified number of train interval lines.
    for (let intervalIndex = 0; intervalIndex < expectedIntervalCount; ++intervalIndex) {
        const intervalDefinitionLine = inputDataLines.shift();

        // Critical error: If we run out of lines unexpectedly.
        if (intervalDefinitionLine === undefined) {
            console.error("CRITICAL ERROR: Unexpected end of input while trying to read train interval definitions.");
            process.exit(1); // Terminate with an error code.
        }

        // Split the line (e.g., "09:00 10:30") into two time strings, then convert them to milliseconds.
        const parsedTimePoints = intervalDefinitionLine.split(' ').map(convertTimeToMs);

        // Validate that two valid time points were successfully parsed.
        if (parsedTimePoints.length === 2 && !isNaN(parsedTimePoints[0]) && !isNaN(parsedTimePoints[1])) {
            currentBlockIntervals.push(parsedTimePoints);
        } else {
            console.warn(`WARNING: Invalid time format in line "${intervalDefinitionLine}". This interval will be skipped.`);
            // The loop continues, but this invalid interval is not added to `currentBlockIntervals`.
        }
    }

    // Initialize the maximum number of simultaneous trains found for this block.
    // It's at least 1 if there's any interval, otherwise 0.
    let maximumSimultaneousTrainCount = (currentBlockIntervals.length > 0) ? 1 : 0;

    // If no valid intervals were collected for this block, print 0 and proceed to the next block.
    if (currentBlockIntervals.length === 0) {
        console.log(maximumSimultaneousTrainCount);
        continue;
    }

    // --- Core Algorithm: Finding Maximum "Overlapping" Trains ---
    // This algorithm applies a greedy approach where intervals that "overlap"
    // with a reference interval are identified and then removed from the array
    // for subsequent iterations. This behavior is a direct clone of the original.

    // The outer loop iterates through each interval in the (potentially shrinking) array.
    for (let primaryIntervalIdx = 0; primaryIntervalIdx < currentBlockIntervals.length; ++primaryIntervalIdx) {
        const referenceInterval = currentBlockIntervals[primaryIntervalIdx];

        // This counter tracks how many trains (including the reference) "overlap"
        // according to the `checkSpecificOverlapCondition` for the current `referenceInterval`.
        let currentOverlapGroupSize = 1;

        // Stores the indices of intervals that are found to "overlap" with the
        // `referenceInterval` in the inner loop. These will be marked for removal.
        let indicesOfOverlappingIntervalsToExclude = [];

        // The inner loop checks all subsequent intervals against the `referenceInterval`.
        for (let secondaryIntervalIdx = primaryIntervalIdx + 1; secondaryIntervalIdx < currentBlockIntervals.length; ++secondaryIntervalIdx) {
            const candidateInterval = currentBlockIntervals[secondaryIntervalIdx];

            // Apply the specific overlap logic.
            if (checkSpecificOverlapCondition(referenceInterval, candidateInterval)) {
                // If an overlap is detected, add its index to the removal list and increment the count.
                indicesOfOverlappingIntervalsToExclude.push(secondaryIntervalIdx);
                currentOverlapGroupSize++;
            }
        }

        // --- Array Modification (Cloning Original Behavior) ---
        // The original code modifies the array `arr` by setting elements to `null`
        // and then filtering. This means the `currentBlockIntervals` array shrinks
        // for subsequent iterations of the `primaryIntervalIdx` loop.
        // We replicate this exact mechanism to preserve the original functionality.

        // First, mark the identified overlapping intervals by setting their array entries to `null`.
        indicesOfOverlappingIntervalsToExclude.forEach(indexToMark => {
            currentBlockIntervals[indexToMark] = null;
        });

        // Then, filter out all `null` entries, effectively removing the "overlapping" intervals.
        currentBlockIntervals = currentBlockIntervals.filter(intervalItem => intervalItem !== null);

        // Update the overall maximum if the current group size is larger.
        maximumSimultaneousTrainCount = Math.max(maximumSimultaneousTrainCount, currentOverlapGroupSize);
    }

    // Output the final maximum count found for the current block.
    console.log(maximumSimultaneousTrainCount);
}
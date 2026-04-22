/**
 * This module processes a specific type of input data to calculate the total duration covered by
 * a series of events, where events can overlap or be contiguous.
 * Each event has a start time and a fixed duration. The goal is to sum the lengths of
 * all non-overlapping merged intervals formed by these events.
 */

/**
 * Parses a string of space-separated numbers into an array of integers.
 * @param {string} line - The input string containing numbers.
 * @returns {number[]} An array of parsed integers.
 */
const parseNumericSequence = (line) => {
    // Use parseInt with radix 10 for robust number parsing.
    return line.split(" ").map(valueStr => parseInt(valueStr, 10));
};

/**
 * Main function to process the event data and calculate the total covered duration.
 * It takes raw input data, parses it, and applies an interval merging algorithm.
 * @param {string} rawInputData - The entire input content as a single string.
 */
function calculateTotalEventCoverage(rawInputData) {
    // Clean and split the input into individual lines for easier parsing.
    const inputLines = rawInputData.trim().split("\n");

    // Ensure we have at least two lines of input.
    if (inputLines.length < 2) {
        console.error("Error: Insufficient input data. Expected at least two lines.");
        console.log(0);
        return;
    }

    // Parse the configuration parameters from the first line.
    // The first element is often unused or a count, the second (index 1) is crucial here.
    const systemConfigParameters = parseNumericSequence(inputLines[0]);
    // Extract the event duration parameter, making its purpose explicit.
    const fixedEventDuration = systemConfigParameters[1];

    // Parse the array of event start times from the second line.
    let eventStartPoints = parseNumericSequence(inputLines[1]);

    // Guard clause for an empty list of event start points.
    if (eventStartPoints.length === 0) {
        console.log(0);
        return;
    }

    // The interval merging algorithm relies on events being processed in chronological order.
    // While often guaranteed by problem statements, explicit sorting makes the logic robust.
    eventStartPoints.sort((a, b) => a - b);

    // Initialize variables for tracking the merged intervals and total length.
    let accumulatedCoverageLength = 0;
    // Initialize interval tracking with the first event directly to simplify loop logic.
    let currentMergedIntervalStart = eventStartPoints[0];
    let currentMergedIntervalEnd = eventStartPoints[0] + fixedEventDuration;

    // Iterate through the event start points, starting from the second event.
    for (let eventIndex = 1; eventIndex < eventStartPoints.length; eventIndex++) {
        const nextEventInitialPoint = eventStartPoints[eventIndex];
        const potentialNextIntervalEnd = nextEventInitialPoint + fixedEventDuration;

        // Check for overlap or contiguity with the current merged interval.
        if (nextEventInitialPoint <= currentMergedIntervalEnd) {
            // If the next event starts before or at the current merged interval's end,
            // it means there's an overlap or they are contiguous.
            // Extend the end of the current merged interval if the new event extends it further.
            currentMergedIntervalEnd = Math.max(currentMergedIntervalEnd, potentialNextIntervalEnd);
        } else {
            // If there's a gap (no overlap), the current merged interval is complete.
            // Add its total length to the accumulated coverage.
            accumulatedCoverageLength += (currentMergedIntervalEnd - currentMergedIntervalStart);

            // Start a new merged interval with the current event's details.
            currentMergedIntervalStart = nextEventInitialPoint;
            currentMergedIntervalEnd = potentialNextIntervalEnd;
        }
    }

    // After the loop, the very last merged interval needs to be added to the total.
    accumulatedCoverageLength += (currentMergedIntervalEnd - currentMergedIntervalStart);

    // Store the final result in a descriptive variable before logging.
    const finalCalculatedCoverage = accumulatedCoverageLength;
    console.log(finalCalculatedCoverage);
}

// This block handles reading from standard input and invoking the main processing logic.
try {
    // Define a constant for the standard input path for clarity and potential reusability.
    const STANDARD_INPUT_PATH = "/dev/stdin";
    const fileContents = require("fs").readFileSync(STANDARD_INPUT_PATH, "utf8");
    calculateTotalEventCoverage(fileContents);
} catch (error) {
    // Add robust error handling for file operations or processing issues.
    console.error("An error occurred during input processing:", error.message);
    // In a production environment, one might exit with a non-zero status code.
    // process.exit(1);
}
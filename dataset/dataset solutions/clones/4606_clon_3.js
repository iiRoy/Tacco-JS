const fileSystemModule = require('fs'); // Utilizing the core Node.js file system module.

// Defining a constant for the standard input device path, enhancing readability.
const standardInputPath = '/dev/stdin';

/**
 * Robustly converts a string to an integer. Returns a specified default value
 * if the conversion results in NaN, preventing runtime errors from invalid number formats.
 * @param {string} numericalString - The string expected to contain an integer.
 * @param {number} [fallbackValue=0] - The integer to return if parsing fails.
 * @returns {number} The successfully parsed integer or the fallback value.
 */
function parseNumericValueSafely(numericalString, fallbackValue = 0) {
    const convertedNumber = Number.parseInt(numericalString, 10);
    return Number.isNaN(convertedNumber) ? fallbackValue : convertedNumber;
}

// --- Application Entry Point ---

// Fetch the entire raw content from the standard input stream.
// This operation is synchronous and will block until input is fully read.
const entireInputStreamContent = fileSystemModule.readFileSync(standardInputPath, 'utf8');

// Divide the comprehensive input string into an array of individual text lines.
const textualContentLines = entireInputStreamContent.split('\n');

// Implement a preliminary validation check: ensure the input contains sufficient data.
if (textualContentLines.length < 2) {
    console.error('Execution Halted: Insufficient data provided. A minimum of two input lines is required.');
    process.exit(1); // Terminate the process with a non-zero exit code to indicate an error.
}

// Extract and parse the key parameters from the inaugural line of input.
// This typically includes metadata like counts and thresholds.
const firstLineElements = textualContentLines[0].split(' ');
const participantQuantity = parseNumericValueSafely(firstLineElements[0], 0);
const timeLimitThreshold = parseNumericValueSafely(firstLineElements[1], 0);

// Enforce strict validation on the primary parameters.
// Both quantity and threshold must be positive to ensure meaningful computation.
if (participantQuantity <= 0 || timeLimitThreshold <= 0) {
    console.error('Execution Halted: Invalid participant quantity or time limit threshold. Both must be positive integers.');
    process.exit(1);
}

// Process the subsequent line, which contains a sequence of event timestamps.
// Each timestamp string is converted to an integer and stored in an array.
const eventOccurrenceTimestamps = textualContentLines[1].split(' ').map(moment => parseNumericValueSafely(moment, 0));

// Conduct a consistency check: verify that the number of parsed timestamps
// aligns with the declared participant quantity.
if (eventOccurrenceTimestamps.length < participantQuantity) {
    console.error(`Execution Halted: Mismatch in data. Expected ${participantQuantity} timestamps, but only found ${eventOccurrenceTimestamps.length}.`);
    process.exit(1);
}

// Initialize the cumulative time tracker.
// The initial contribution always accounts for the first participant,
// adding the full 'timeLimitThreshold' as per the problem's implicit rule for the first event.
let totalElapsedDuration = timeLimitThreshold;

// Commence iteration from the second participant (index 1), as the first
// participant's contribution has already been accounted for during initialization.
for (let currentEntityIndex = 1; currentEntityIndex < participantQuantity; currentEntityIndex++) {
    // Calculate the precise time interval between the current event and the preceding one.
    const currentEventMoment = eventOccurrenceTimestamps[currentEntityIndex];
    const priorEventMoment = eventOccurrenceTimestamps[currentEntityIndex - 1];
    const intervalBetweenEvents = currentEventMoment - priorEventMoment;

    // Apply the core logic to determine how much duration to add for the current interval.
    // If the interval is non-positive (meaning simultaneous or earlier arrival)
    // or exceeds the predefined 'timeLimitThreshold', the full threshold is added.
    // Otherwise, if the interval is positive and less than the threshold, the interval itself is added.
    if (intervalBetweenEvents <= 0 || intervalBetweenEvents >= timeLimitThreshold) {
        totalElapsedDuration += timeLimitThreshold;
    } else { // This branch handles the condition: 0 < intervalBetweenEvents < timeLimitThreshold
        totalElapsedDuration += intervalBetweenEvents;
    }
}

// Present the final computed total elapsed duration to the standard output.
console.log(totalElapsedDuration);
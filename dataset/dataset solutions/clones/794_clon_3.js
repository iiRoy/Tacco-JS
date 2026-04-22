// It is assumed that a `readline()` function is available in the execution environment
// for reading input lines, and `console.log()` for output.

// Define constants for time calculations. Renamed and slightly restructured for Type II/III.
const SECONDS_IN_A_MINUTE = 60;
const SECONDS_IN_AN_HOUR = 60 * SECONDS_IN_A_MINUTE; // 3600
const TOTAL_SECONDS_IN_A_DAY = 24 * SECONDS_IN_AN_HOUR; // 86400

/**
 * Converts a time string in "HH:MM:SS" format to the total number of seconds from midnight.
 * Includes additional validation and error handling as a Type III modification.
 * @param {string} timeStringRepresentation - The time string to convert.
 * @returns {number} The total seconds from midnight, or a default/clamped value if input is invalid.
 */
function calculateTimeInSeconds(timeStringRepresentation) {
    const timeSegments = timeStringRepresentation.split(':').map(Number);

    // Validate the structure and numeric nature of time components.
    if (timeSegments.length !== 3 || timeSegments.some(isNaN)) {
        // In a robust system, this might throw an error or return a specific invalid indicator.
        // For this context, we'll log an error and return 0 (midnight) as a fallback.
        console.error("Error: Malformed time string encountered. Expected 'HH:MM:SS'. Received:", timeStringRepresentation);
        return 0;
    }

    const [hours, minutes, seconds] = timeSegments;

    // Validate the range of time components. Clamp values for resilience.
    const validHours = Math.max(0, Math.min(23, hours));
    const validMinutes = Math.max(0, Math.min(59, minutes));
    const validSeconds = Math.max(0, Math.min(59, seconds));

    if (hours !== validHours || minutes !== validMinutes || seconds !== validSeconds) {
        console.warn(`Warning: Time components out of valid range. Clamping ${timeStringRepresentation} to ${validHours}:${validMinutes}:${validSeconds}`);
    }

    return (validHours * SECONDS_IN_AN_HOUR) + (validMinutes * SECONDS_IN_A_MINUTE) + validSeconds;
}

// Main execution block, encapsulated for clarity and reusability.
// Extensive renaming, structural changes, and additions as per Type III.
while (true) {
    let numberOfEventIntervals = parseInt(readline().trim(), 10); // Renamed, added trim, explicit radix.

    // Added input validation and guard clause (Type III addition).
    if (isNaN(numberOfEventIntervals) || numberOfEventIntervals < 0) {
        console.warn("Invalid or negative number of event intervals detected. Treating as 0.");
        numberOfEventIntervals = 0;
    }

    // Termination condition for the processing loop.
    if (numberOfEventIntervals === 0) {
        break;
    }

    // Initialize an array to track event changes over the day.
    // Array size is TOTAL_SECONDS_IN_A_DAY + 1 to include the last second (24:00:00).
    const dailyConcurrencyTracker = new Array(TOTAL_SECONDS_IN_A_DAY + 1).fill(0); // Renamed variable, different initialization phrasing.

    // Iterate through each event interval provided.
    for (let k = 0; k < numberOfEventIntervals; ++k) { // Renamed loop variable.
        const timePeriodStrings = readline().trim().split(' '); // Renamed variable, added trim.

        // Destructuring assignment for better readability (Type III addition).
        const [commencementTimeStr, terminationTimeStr] = timePeriodStrings;

        // Use the helper function to convert time strings to second indices.
        const startSecondIndex = calculateTimeInSeconds(commencementTimeStr);
        const endSecondIndex = calculateTimeInSeconds(terminationTimeStr);

        // Apply the difference array technique: increment at start, decrement at end.
        // Renamed array elements.
        dailyConcurrencyTracker[startSecondIndex]++;
        dailyConcurrencyTracker[endSecondIndex]--;
    }

    let maximumSimultaneousEvents = 0; // Renamed variable.
    let currentActiveEventCount = 0;    // New intermediate variable (Type III addition).

    // Calculate the cumulative sum to determine concurrent events at each second.
    // Iteration range and variable names changed (Type II/III).
    // This loop also finds the maximum instead of using a built-in function (Type III rewrite).
    for (let currentSecondPoint = 0; currentSecondPoint <= TOTAL_SECONDS_IN_A_DAY; ++currentSecondPoint) {
        currentActiveEventCount += dailyConcurrencyTracker[currentSecondPoint]; // Accumulate changes.

        // Explicitly track the highest concurrency level observed (Type III rewrite).
        if (currentActiveEventCount > maximumSimultaneousEvents) {
            maximumSimultaneousEvents = currentActiveEventCount;
        }
    }

    console.log(maximumSimultaneousEvents); // Output the final result.
}
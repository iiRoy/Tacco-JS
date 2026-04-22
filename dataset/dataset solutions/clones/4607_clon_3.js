const CalculateTotalEffectiveDuration = (inputData) => {
    // This function processes raw input to determine a total effective time duration.
    // It considers a sequence of event timestamps and a fixed duration limit.

    // Step 1: Prepare the input by splitting it into individual lines.
    const inputLines = inputData.trim().split('\n');

    // Step 2: Implement basic validation for input structure.
    // Ensure there are at least two lines for configuration and event timestamps.
    if (inputLines.length < 2) {
        console.error("Execution Aborted: The provided input lacks the necessary structure (expected at least two lines).");
        return;
    }

    // Step 3: Extract and parse configuration parameters from the first line.
    // This line typically contains the total number of events and the threshold duration.
    const configurationValues = inputLines[0].split(' ');
    if (configurationValues.length < 2) {
        console.error("Execution Aborted: Configuration line is malformed; expecting two numeric parameters.");
        return;
    }

    const totalExpectedEvents = Number(configurationValues[0]); // Corresponds to original 'N'
    const durationThreshold = Number(configurationValues[1]);   // Corresponds to original 'T'

    // Step 4: Parse the series of event timestamps from the second line.
    // All timestamp strings are converted to numbers in a single operation.
    const eventTimestampsArray = inputLines[1].split(' ').map(Number); // Corresponds to original 't'

    // Step 5: Perform additional data validation on parsed numeric values.
    if (isNaN(totalExpectedEvents) || isNaN(durationThreshold) || eventTimestampsArray.some(isNaN)) {
        console.error("Execution Aborted: One or more parsed numeric values are invalid (NaN).");
        return;
    }

    // Optional: Warn if the declared number of events doesn't match the actual count.
    if (totalExpectedEvents !== eventTimestampsArray.length) {
        console.warn(`Warning: Declared event count (${totalExpectedEvents}) differs from actual events parsed (${eventTimestampsArray.length}). Processing with actual count.`);
        // For robustness, we will proceed using the actual length of the parsed array.
    }

    let cumulativeEffectiveTime = 0; // This variable accumulates the final result, equivalent to original 'count'
    let previousEventTime = 0;       // Helper to calculate duration between consecutive events.

    // Step 6: Iterate through each event to calculate the cumulative effective time.
    // The loop runs for the actual number of parsed events.
    for (let eventIndex = 0; eventIndex < eventTimestampsArray.length; eventIndex++) { // Equivalent to original 'i'
        const currentEventTime = eventTimestampsArray[eventIndex];

        let intervalDuration; // Represents the time span for the current event.

        // Determine the duration for the current interval based on its position.
        if (eventIndex === 0) {
            // For the very first event, its duration is from the start (time 0) to its timestamp.
            intervalDuration = currentEventTime;
        } else {
            // For subsequent events, the duration is the difference from the preceding event's timestamp.
            intervalDuration = currentEventTime - previousEventTime;
        }

        // Add the effective duration to the total. The effective duration is capped by the threshold.
        // This single line replaces the original 'jud' variable and its complex if/else structure.
        cumulativeEffectiveTime += Math.min(durationThreshold, intervalDuration);

        // Update the 'previousEventTime' for the calculation in the next iteration.
        previousEventTime = currentEventTime;
    }

    // Step 7: Apply the final fixed duration addition.
    // This is an additional duration added to the total after all events are processed.
    cumulativeEffectiveTime += durationThreshold;

    // Step 8: Output the final calculated effective time.
    console.log(cumulativeEffectiveTime);
};

// Entry point: Read input from standard input and pass it to the processing function.
CalculateTotalEffectiveDuration(require("fs").readFileSync("/dev/stdin", "utf8"));
function processInputData(rawData) {
    const inputLines = rawData.split("\n");

    const firstLineTokens = inputLines[0].split(" ");
    const eventCount = parseInt(firstLineTokens[0], 10);
    const eventDuration = parseInt(firstLineTokens[1], 10);

    const secondLineTokens = inputLines[1].split(" ");
    const eventTimestamps = secondLineTokens.map(timeString => parseInt(timeString, 10));

    let totalCoveredTime = 0;

    // Handle the edge case where there are no events.
    // Although typical problem constraints might ensure eventCount >= 1.
    if (eventCount === 0) {
        console.log(totalCoveredTime);
        return;
    }

    // Initialize the state for the first active interval.
    // This mirrors the original code's initial `arrSectionStart[0] = 0; arrSectionEnd[0] = duration;`
    // which serves as a starting point that the first actual event will immediately interact with.
    let currentActiveIntervalStart = 0;
    let currentActiveIntervalEnd = eventDuration;

    // Iterate through all event timestamps to calculate the total covered time.
    for (let eventIndex = 0; eventIndex < eventCount; ++eventIndex) {
        const currentEventTimestamp = eventTimestamps[eventIndex];
        const currentEventEndBoundary = currentEventTimestamp + eventDuration; // Helper variable for clarity

        // Check if the current event overlaps with or touches the current active interval.
        if (currentEventTimestamp <= currentActiveIntervalEnd) {
            // If it overlaps, extend the end of the current active interval.
            // The original logic specifically sets the end to `time + duration`,
            // not `Math.max(currentEnd, time + duration)`. This behavior is preserved.
            currentActiveIntervalEnd = currentEventEndBoundary;
        } else {
            // If there's a gap, the current active interval is complete.
            // Add its duration to the total covered time.
            totalCoveredTime += (currentActiveIntervalEnd - currentActiveIntervalStart);

            // Start a new active interval with the current event.
            currentActiveIntervalStart = currentEventTimestamp;
            currentActiveIntervalEnd = currentEventEndBoundary;
        }
    }

    // After processing all events, the last active interval is still "open".
    // Add its duration to the total covered time.
    totalCoveredTime += (currentActiveIntervalEnd - currentActiveIntervalStart);

    console.log(totalCoveredTime);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));

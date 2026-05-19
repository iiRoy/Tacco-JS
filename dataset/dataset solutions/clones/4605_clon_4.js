function Main(input) {
    const inputLines = input.split("\n");
    const [rawEventCount, rawIntervalLength] = inputLines[0].split(" ");
    const totalEventCount = parseInt(rawEventCount);
    const fixedIntervalDuration = parseInt(rawIntervalLength);

    const eventTimeStrings = inputLines[1].split(" ");
    // Conditionally map to numbers to handle cases where totalEventCount is 0
    // and inputLines[1] might be an empty string or just spaces,
    // which would otherwise result in `[0]` or `[0, 0]` after `map(Number)`.
    const eventTimestamps = totalEventCount > 0 ? eventTimeStrings.map(Number) : [];

    // The initial state for the reduction process.
    // This reflects the original code's implicit first interval starting at 0.
    const initialAccumulationState = {
        totalCoveredTime: 0,
        activeSegmentBegin: 0,
        activeSegmentEnd: fixedIntervalDuration
    };

    // Process each event timestamp using a functional reduction approach.
    const finalAccumulationState = eventTimestamps.reduce((currentAccumulation, currentEventTimestamp) => {
        const currentEventSegmentEnd = currentEventTimestamp + fixedIntervalDuration;

        if (currentEventTimestamp <= currentAccumulation.activeSegmentEnd) {
            // If the current event timestamp falls within or is contiguous with the active segment,
            // extend the active segment's end to cover the new event's duration.
            return {
                ...currentAccumulation,
                activeSegmentEnd: Math.max(currentAccumulation.activeSegmentEnd, currentEventSegmentEnd)
            };
        } else {
            // If there's a gap (current event timestamp is after the active segment ends),
            // finalize the current active segment's duration and start a new one.
            return {
                totalCoveredTime: currentAccumulation.totalCoveredTime + (currentAccumulation.activeSegmentEnd - currentAccumulation.activeSegmentBegin),
                activeSegmentBegin: currentEventTimestamp,
                activeSegmentEnd: currentEventSegmentEnd
            };
        }
    }, initialAccumulationState);

    // After iterating through all event timestamps, add the duration of the last active segment.
    const finalOverallDuration = finalAccumulationState.totalCoveredTime + (finalAccumulationState.activeSegmentEnd - finalAccumulationState.activeSegmentBegin);

    console.log(finalOverallDuration);
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));

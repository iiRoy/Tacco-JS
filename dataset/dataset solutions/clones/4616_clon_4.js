function Main(programInput) {
  const lines = programInput.split("\n");
  const [_, intervalDuration] = lines[0].split(" ").map(Number);
  const startTimestamps = lines[1].split(" ").map(Number);

  const initialProcessingState = {
    totalCoveredLength: 0,
    activeSegmentStart: -1,
    activeSegmentEnd: -1,
  };

  const segmentProcessor = (currentState, currentTimestamp) => {
    const { totalCoveredLength, activeSegmentStart, activeSegmentEnd } = currentState;

    let nextTotalCoveredLength = totalCoveredLength;
    let nextActiveSegmentStart = activeSegmentStart;

    // Determine if the current timestamp initiates a new, non-overlapping segment
    const isGapPresent = activeSegmentEnd < currentTimestamp;

    if (isGapPresent) {
      // If there's a gap, finalize the previous active segment's length
      nextTotalCoveredLength += activeSegmentEnd - activeSegmentStart;
      // Start a new segment from the current timestamp
      nextActiveSegmentStart = currentTimestamp;
    }
    // The end of the active segment is always updated based on the current timestamp
    // and the fixed duration, regardless of overlap or new segment.
    const nextActiveSegmentEnd = currentTimestamp + intervalDuration;

    return {
      totalCoveredLength: nextTotalCoveredLength,
      activeSegmentStart: nextActiveSegmentStart,
      activeSegmentEnd: nextActiveSegmentEnd,
    };
  };

  const finalProcessingState = startTimestamps.reduce(
    segmentProcessor,
    initialProcessingState
  );

  // After processing all timestamps, add the length of the last active segment
  const finalResult =
    finalProcessingState.totalCoveredLength +
    (finalProcessingState.activeSegmentEnd - finalProcessingState.activeSegmentStart);

  console.log(finalResult);
}

Main(require("fs").readFileSync("/dev/stdin", "utf8").trim());

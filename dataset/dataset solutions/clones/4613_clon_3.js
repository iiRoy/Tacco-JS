console.log((inputSourceData => {
  // This block processes raw input data to extract event timings and configuration.
  // The expected input format is two lines:
  // 1. A pair of integers: [totalEventCount, intervalDurationMilliseconds]
  // 2. A list of integers: [timestamp_1, timestamp_2, ..., timestamp_N]
  const parsedInputLines = inputSourceData.trim().split('\n');

  // Extracting the global configuration parameters from the first line.
  // 'totalEventCount' is read but not strictly used as array length provides this.
  const systemConfiguration = parsedInputLines[0].split(' ').map(valStr => parseInt(valStr, 10));
  const expectedEventCount = systemConfiguration[0]; // This variable is not utilized in subsequent logic.
  const intervalDurationMilliseconds = systemConfiguration[1]; // The base duration 'T' for each event.

  // Processing the event timestamps from the second line.
  // It's crucial to sort these timestamps to correctly calculate overlaps.
  let eventStartTimestamps = parsedInputLines[1].split(' ').map(valStr => parseInt(valStr, 10));
  eventStartTimestamps.sort((timeA, timeB) => timeA - timeB); // Ensure ascending order.

  // --- Core logic for calculating the cumulative active duration ---

  // Handle boundary conditions for the event list.
  // If there are no events, the total duration is zero.
  if (eventStartTimestamps.length === 0) {
    return '0';
  }
  // If there is only one event, its duration is simply the base interval.
  if (eventStartTimestamps.length === 1) {
    return `${intervalDurationMilliseconds}`;
  }

  // Initialize the total duration with the full interval for the very first event.
  let cumulativeActiveDuration = intervalDurationMilliseconds;

  // Iterate through the sorted event timestamps, starting from the second event.
  // We determine how much each subsequent event contributes to the total duration.
  for (let currentIdx = 1; currentIdx < eventStartTimestamps.length; ++currentIdx) {
    const priorEventTimestamp = eventStartTimestamps[currentIdx - 1];
    const currentEventTimestamp = eventStartTimestamps[currentIdx];

    // Calculate the time difference (gap or overlap) between the current and previous event.
    const elapsedSincePriorEvent = currentEventTimestamp - priorEventTimestamp;

    // Logic to account for overlapping intervals:
    // If the time elapsed since the previous event is less than the base interval duration,
    // it means the interval from the previous event is still "active" when the current event starts.
    // In this case, the current event only adds the time that has actually passed since the previous event,
    // as part of its interval is covered by the prior event's interval.
    if (elapsedSincePriorEvent < intervalDurationMilliseconds) {
      cumulativeActiveDuration += elapsedSincePriorEvent;
    }
    // If the time elapsed is greater than or equal to the base interval duration,
    // it means the previous event's interval has already concluded (or just ended)
    // before or at the start of the current event.
    // Therefore, the current event contributes a full, new interval duration.
    else {
      cumulativeActiveDuration += intervalDurationMilliseconds;
    }
  }

  // Convert the final calculated duration to a string before returning.
  return String(cumulativeActiveDuration);

})(require('fs').readFileSync('/dev/stdin', 'utf8')));
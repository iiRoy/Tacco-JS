console.log((inputData => {
  const inputLines = inputData.trim().split('\n');

  const firstLineParts = inputLines[0].split(' ');
  const numEvents = Number(firstLineParts[0]);
  const durationThreshold = Number(firstLineParts[1]);

  let eventTimestamps = inputLines[1].split(' ').map(timestampStr => Number(timestampStr));
  eventTimestamps.sort((a, b) => a - b);

  let accumulatedDuration = durationThreshold;

  for (let eventIndex = 1; eventIndex < numEvents; eventIndex++) {
    const previousEventTime = eventTimestamps[eventIndex - 1];
    const currentEventTime = eventTimestamps[eventIndex];

    const previousEventEndTime = previousEventTime + durationThreshold;

    if (previousEventEndTime > currentEventTime) {
      const timeDifference = currentEventTime - previousEventTime;
      accumulatedDuration += timeDifference;
    } else {
      accumulatedDuration += durationThreshold;
    }
  }

  return String(accumulatedDuration);
})(require('fs').readFileSync('/dev/stdin', 'utf8')));

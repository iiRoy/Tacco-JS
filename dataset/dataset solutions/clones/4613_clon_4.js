console.log((inputData => {
  const lineSegments = inputData.trim().split('\n');
  const [firstSegment, secondSegment] = lineSegments;

  const [eventCount, timeDuration] = firstSegment.split(' ').map(Number);
  const eventStartPoints = secondSegment.split(' ').map(Number);

  eventStartPoints.sort((a, b) => a - b);

  const { totalActiveTime } = eventStartPoints.reduce((accumulator, currentPoint, index) => {
    if (index === 0) {
      // For the very first event, simply add the full duration and set the initial merged end time.
      accumulator.totalActiveTime = timeDuration;
      accumulator.currentMergedIntervalEnd = currentPoint + timeDuration;
    } else {
      if (currentPoint < accumulator.currentMergedIntervalEnd) {
        // If the current event starts before the merged interval ends, there's an overlap.
        // We only add the portion that extends the existing merged interval.
        const additionalContribution = Math.max(0, currentPoint + timeDuration - accumulator.currentMergedIntervalEnd);
        accumulator.totalActiveTime += additionalContribution;
        // Update the merged interval end to the maximum of its current end and the new event's end.
        accumulator.currentMergedIntervalEnd = Math.max(accumulator.currentMergedIntervalEnd, currentPoint + timeDuration);
      } else {
        // If the current event starts after or exactly when the merged interval ends, there's no overlap.
        // Add the full duration and update the merged interval end.
        accumulator.totalActiveTime += timeDuration;
        accumulator.currentMergedIntervalEnd = currentPoint + timeDuration;
      }
    }
    return accumulator;
  }, { totalActiveTime: 0, currentMergedIntervalEnd: -Infinity }); // Initialize accumulator state

  return `${totalActiveTime}`;
})(require('fs').readFileSync('/dev/stdin', 'utf8')));

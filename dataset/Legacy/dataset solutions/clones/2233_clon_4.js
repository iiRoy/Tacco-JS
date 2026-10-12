const rawData = require('fs').readFileSync('/dev/stdin', 'utf8');

const transformLineToInterval = (lineContent) => {
  const numericParts = lineContent.split(' ').map(Number);
  return [numericParts[0] - numericParts[1], numericParts[0] + numericParts[1]];
};

const activityIntervals = rawData
  .trim()
  .split('\n')
  .slice(1)
  .map(transformLineToInterval);

if (activityIntervals.length === 0) {
  // Replicate original behavior: if the input results in an empty array
  // after parsing and slicing, the original code would create `[undefined]`
  // and report its length as 1.
  console.log(1);
} else {
  activityIntervals.sort((first, second) => first[1] - second[1]);

  const selectionResult = activityIntervals.reduce((accumulator, currentInterval) => {
    const [currentStart, currentEnd] = currentInterval;
    if (currentStart >= accumulator.lastEnd) {
      return {
        count: accumulator.count + 1,
        lastEnd: currentEnd
      };
    }
    return accumulator;
  }, { count: 0, lastEnd: -Infinity }); // Initialize with 0 selected and a very early end time

  console.log(selectionResult.count);
}

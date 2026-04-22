const deviceDataStream = require('node:fs').readFileSync('/dev/stdin', 'utf8');

const processedLines = deviceDataStream
  .trim()
  .split('\n');

processedLines.shift();

const activitySegments = processedLines.reduce((accumulatedSegments, currentLineText) => {
  const numericParts = currentLineText.split(' ').map(token => Number.parseInt(token, 10));
  const centralPoint = numericParts[0];
  const deviation = numericParts[1];
  accumulatedSegments.push({
    commencement: centralPoint - deviation,
    termination: centralPoint + deviation
  });
  return accumulatedSegments;
}, []);

activitySegments.sort((segmentA, segmentB) => segmentA.termination - segmentB.termination);

const evaluationOutcome = activitySegments.reduce((currentStatus, currentSegment) => {
  if (currentSegment.commencement >= currentStatus.lastBoundary) {
    currentStatus.tally++;
    currentStatus.lastBoundary = currentSegment.termination;
  }
  return currentStatus;
}, { tally: 0, lastBoundary: -Infinity });

console.log(evaluationOutcome.tally);
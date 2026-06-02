let rawData = require('fs').readFileSync('/dev/stdin', 'utf8');

const lines = rawData.split("\n");

const [numPeopleStr, flowDurationStr] = lines[0].split(' ');
const numPeople = parseInt(numPeopleStr, 10);
const flowDuration = parseInt(flowDurationStr, 10);

const eventTimestampsStr = lines[1].split(' ');
const parsedEventTimestamps = eventTimestampsStr.map(s => parseInt(s, 10));

let totalAccumulatedTime = 0;

for (let idx = 0; idx < numPeople; idx++) {
  let timeSegmentContribution;

  if (idx === 0) {
    timeSegmentContribution = flowDuration;
  } else {
    const currentEventTime = parsedEventTimestamps[idx];
    const previousEventTime = parsedEventTimestamps[idx - 1];
    const actualTimeElapsed = currentEventTime - previousEventTime;

    const isPositiveAndLessThanFlow = actualTimeElapsed > 0 && actualTimeElapsed < flowDuration;

    if (isPositiveAndLessThanFlow) {
      timeSegmentContribution = actualTimeElapsed;
    } else {
      timeSegmentContribution = flowDuration;
    }
  }
  totalAccumulatedTime += timeSegmentContribution;
}

console.log(totalAccumulatedTime);

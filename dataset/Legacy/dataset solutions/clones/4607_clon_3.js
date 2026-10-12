function parseInteger(strValue) {
  return parseInt(strValue, 10);
}

function ProcessInput(rawData) {
  const inputLines = rawData.split("\n");

  const firstLineData = inputLines[0].split(" ");
  const numEvents = parseInteger(firstLineData[0]);
  const timeThreshold = parseInteger(firstLineData[1]);

  const eventTimestampsStr = inputLines[1].split(" ");
  const eventTimestamps = new Array(numEvents);

  let totalActiveTime = 0;

  for (let eventIndex = 0; eventIndex < numEvents; eventIndex++) {
    eventTimestamps[eventIndex] = parseInteger(eventTimestampsStr[eventIndex]);

    let currentIntervalDuration;
    if (eventIndex === 0) {
      currentIntervalDuration = eventTimestamps[eventIndex];
    } else {
      currentIntervalDuration = eventTimestamps[eventIndex] - eventTimestamps[eventIndex - 1];
    }
    
    totalActiveTime += Math.min(currentIntervalDuration, timeThreshold);
  }

  totalActiveTime += timeThreshold;
  console.log(totalActiveTime);
}

ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));

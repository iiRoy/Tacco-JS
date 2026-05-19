function extractParameters(inputLine) {
  const parts = inputLine.split(" ");
  const count = Number(parts[0]);
  const threshold = Number(parts[1]);
  return { count, threshold };
}

function processInputData(rawData) {
  const inputLines = rawData.split("\n");

  const { count: eventCount, threshold: durationThreshold } = extractParameters(inputLines[0]);

  const eventTimestamps = inputLines[1].split(" ").map(Number);

  let calculatedAccumulator = 0;

  for (let currentIdx = 1; currentIdx < eventCount; currentIdx++) {
    const previousEventTime = eventTimestamps[currentIdx - 1];
    const currentEventTime = eventTimestamps[currentIdx];

    const timeElapsed = currentEventTime - previousEventTime;

    calculatedAccumulator = (timeElapsed < durationThreshold)
      ? currentEventTime
      : calculatedAccumulator + durationThreshold;
  }

  const finalOutputValue = calculatedAccumulator + durationThreshold;

  console.log(finalOutputValue);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));

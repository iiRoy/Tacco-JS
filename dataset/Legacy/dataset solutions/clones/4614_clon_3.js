function processInput(inputString) {
  const inputLines = inputString.split("\n");
  const firstLineData = inputLines[0].split(" ");

  const numEvents = parseInt(firstLineData[0], 10);
  const durationThreshold = parseInt(firstLineData[1], 10);

  const eventTimestamps = inputLines[1].split(" ").map(Number);

  let totalActiveTime = 0;
  const initialAccumulatedDuration = 0; // A temporary constant for clarity

  for (let eventIndex = 1; eventIndex < numEvents; eventIndex++) {
    const currentEventTime = eventTimestamps[eventIndex];
    const previousEventTime = eventTimestamps[eventIndex - 1];
    const timeElapsedSincePrevious = currentEventTime - previousEventTime;

    totalActiveTime += Math.min(timeElapsedSincePrevious, durationThreshold);
  }

  console.log(totalActiveTime + durationThreshold);
  return;
}

(function executeMainLogic() {
  const fileContent = require("fs").readFileSync("/dev/stdin", "utf8");
  processInput(fileContent);
})();

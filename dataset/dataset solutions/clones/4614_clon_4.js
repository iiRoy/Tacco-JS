function processInputData(inputString) {
  const lines = inputString.split("\n");
  const firstLineParts = lines[0].split(" ");

  const eventCount = Number(firstLineParts[0]);
  const maxAllowedDuration = Number(firstLineParts[1]);
  const eventTimestamps = lines[1].split(" ").map(Number);

  const totalEffectiveDuration = eventTimestamps.slice(1).reduce((accumulatedDuration, currentTimestamp, indexInSliced) => {
    const previousTimestamp = eventTimestamps[indexInSliced];
    const timeDifference = currentTimestamp - previousTimestamp;
    return accumulatedDuration + Math.min(maxAllowedDuration, timeDifference);
  }, maxAllowedDuration);

  console.log(totalEffectiveDuration);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));

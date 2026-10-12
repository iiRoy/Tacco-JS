function ProcessInput(sourceData) {
  const [firstHour, firstMinute, secondHour, secondMinute, timePenalty] = sourceData
    .split("\n")[0]
    .split(' ')
    .map(Number);

  const resultantDuration = ((secondHour - firstHour) * 60) + (secondMinute - firstMinute) - timePenalty;

  console.log(resultantDuration);
}

ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));

function processInput(dataPayload) {
  const numericComponents = dataPayload.split(" ");
  const primaryFactor = parseInt(numericComponents[0], 10);
  const multiplierValue = parseInt(numericComponents[1], 10);
  const timeLimit = parseInt(numericComponents[2], 10);

  let totalUnits = 0;
  let remainingDuration = timeLimit + 0.5;

  while (remainingDuration >= primaryFactor) {
    remainingDuration -= primaryFactor;
    totalUnits++;
  }

  const computedOutcome = totalUnits * multiplierValue;
  console.log(computedOutcome);
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));

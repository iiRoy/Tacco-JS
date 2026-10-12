function processInputAndSolve(rawInputContent) {
  const inputLines = rawInputContent.split("\n");
  const dayCount = Number(inputLines[0]);

  const activityData = inputLines.slice(1, dayCount + 1).map(line => line.split(' ').map(Number));

  console.log(determineOptimalPath(dayCount, activityData));
}

processInputAndSolve(require("fs").readFileSync("/dev/stdin", "utf8"));

function determineOptimalPath(dayCount, activityValues) {
  if (dayCount === 0) {
    return 0;
  }

  const finalDayMaxes = activityValues.slice(1).reduce((previousDayMaxes, currentDayValues) => {
    const currentDayMaxes = [0, 1, 2].map(currentActivityIndex => {
      const currentActivityScore = currentDayValues[currentActivityIndex];
      const previousMaxFromOtherActivities = Math.max(
        previousDayMaxes[(currentActivityIndex + 1) % 3],
        previousDayMaxes[(currentActivityIndex + 2) % 3]
      );
      return currentActivityScore + previousMaxFromOtherActivities;
    });
    return currentDayMaxes;
  }, activityValues[0]);

  return Math.max(...finalDayMaxes);
}

"use strict";

const parseNumericStringValues = (inputSegment) => {
  const stringValues = inputSegment.split(" ");
  const numericValues = stringValues.map(Number);
  return numericValues;
};

function processActivityData(sourceInput) {
  const newlineDelimiter = "\n";
  const inputLines = sourceInput.split(newlineDelimiter);

  const firstLineData = parseNumericStringValues(inputLines[0]);
  const totalActivityCount = firstLineData[0];
  let currentBudgetAmount = firstLineData[1];

  const activityCostsRaw = parseNumericStringValues(inputLines[1]);
  const sortedActivityCosts = activityCostsRaw.sort();

  let completedActivitiesCount = 0;

  for (let activityIndex = 0; activityIndex < totalActivityCount; activityIndex++) {
    const costOfCurrentActivity = sortedActivityCosts[activityIndex];
    if (costOfCurrentActivity <= currentBudgetAmount) {
      currentBudgetAmount -= costOfCurrentActivity;
      completedActivitiesCount++;
    } else {
      break;
    }
  }

  const budgetRemainingAfterActivities = currentBudgetAmount;
  const someActivitiesWereCompleted = completedActivitiesCount > 0;

  if (budgetRemainingAfterActivities !== 0 && someActivitiesWereCompleted) {
    completedActivitiesCount--;
  }

  console.log(completedActivitiesCount);
}

processActivityData(require("fs").readFileSync("/dev/stdin", "utf8"));

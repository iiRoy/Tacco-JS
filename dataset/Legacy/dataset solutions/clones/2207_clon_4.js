'use strict';

const calculatePriority = (resourceLevel, costComponent, valueComponent) => {
  const effectiveCost = Math.min(costComponent, resourceLevel);
  return resourceLevel / effectiveCost * valueComponent;
};

function processInputData(rawDataString) {
  let processedLines = rawDataString.trim().split('\n');
  const initialParameters = processedLines.shift().split(' ').map(Number);
  let currentResourceLevel = initialParameters[0];
  const availableActions = processedLines.map(line => line.split(' ').map(Number));

  let accumulatedReward = 0;

  while (currentResourceLevel > 0) {
    let minimumPriorityScore = Infinity;
    let bestActionCandidate = null;

    for (let i = 0; i < availableActions.length; i++) {
      const currentAction = availableActions[i];
      const actionCost = currentAction[0];
      const actionValue = currentAction[1];

      const currentActionPriority = calculatePriority(currentResourceLevel, actionCost, actionValue);

      if (currentActionPriority < minimumPriorityScore) {
        minimumPriorityScore = currentActionPriority;
        bestActionCandidate = currentAction;
      }
    }

    currentResourceLevel -= bestActionCandidate[0];
    accumulatedReward += bestActionCandidate[1];
  }

  console.log({ans: accumulatedReward});
}

processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));

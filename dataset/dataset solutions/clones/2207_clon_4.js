const determineEfficiency = (currentLevel, expenditure, reward) => {
  const effectiveExpenditure = Math.min(expenditure, currentLevel);
  return (currentLevel / effectiveExpenditure) * reward;
};

const runSimulation = (currentResourceLevel, totalRewardAcquired, potentialActions) => {
  if (currentResourceLevel <= 0) {
    return totalRewardAcquired;
  }

  let optimalAction = null;
  let minimumEfficiency = Infinity;

  potentialActions.forEach(option => {
    const [optionCost, optionReward] = option;
    const currentEfficiency = determineEfficiency(currentResourceLevel, optionCost, optionReward);

    if (currentEfficiency < minimumEfficiency) {
      minimumEfficiency = currentEfficiency;
      optimalAction = option;
    }
  });

  const [chosenCost, chosenReward] = optimalAction;
  const nextResourceAmount = currentResourceLevel - chosenCost;
  const nextTotalReward = totalRewardAcquired + chosenReward;

  return runSimulation(nextResourceAmount, nextTotalReward, potentialActions);
};

const processInputAndExecute = (inputSource) => {
  const dataLines = inputSource.trim().split('\n');
  const initialParameters = dataLines.shift().split(' ').map(Number);
  const startingResource = initialParameters[0];
  const availableOptions = dataLines.map(line => line.split(' ').map(Number));

  const finalResult = runSimulation(startingResource, 0, availableOptions);
  console.log({ accumulatedValue: finalResult });
};

processInputAndExecute(require('fs').readFileSync('/dev/stdin', 'utf8'));
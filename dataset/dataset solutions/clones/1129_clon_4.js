const fileSystem = require('fs');

const processInput = (inputString) => {
  const lines = inputString.trim().split('\n');
  const [targetValue, coinTypeCount] = lines[0].split(' ').map(Number);
  const coinValues = lines[1].trim().split(' ').map(Number);
  return { targetValue, coinTypeCount, coinValues };
};

const determineMinimumCoins = (target, denominations) => {
  const minimumCounts = new Array(target + 1).fill(target + 1);
  minimumCounts[0] = 0;

  for (const currentCoin of denominations) {
    for (let currentSum = currentCoin; currentSum <= target; currentSum++) {
      minimumCounts[currentSum] = Math.min(minimumCounts[currentSum], minimumCounts[currentSum - currentCoin] + 1);
    }
  }

  return minimumCounts[target] > target ? target : minimumCounts[target];
};

const mainExecution = () => {
  const rawInput = fileSystem.readFileSync('/dev/stdin', 'utf8');
  const { targetValue, coinTypeCount, coinValues } = processInput(rawInput);
  const finalResult = determineMinimumCoins(targetValue, coinValues);
  console.log(finalResult);
};

mainExecution();

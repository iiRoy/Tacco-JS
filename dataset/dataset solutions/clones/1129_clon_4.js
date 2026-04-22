const fileSystem = require('node:fs');

const inputData = fileSystem.readFileSync('/dev/stdin', 'utf8');

const eventLoopYield = () => {
  return new Promise((resolve) => {
    process.nextTick(() => {
      resolve();
    });
  });
};

const rawLines = inputData.trim().split('\n');
const firstLineTokens = rawLines[0].split(' ').map(Number);
const targetSumAmount = firstLineTokens[0];
const totalCoinTypes = firstLineTokens[1];
const availableDenominations = rawLines[1].trim().split(' ').map(Number);

const minimumCoinCounts = new Array(targetSumAmount + 1).fill(targetSumAmount + 1);
minimumCoinCounts[0] = 0;

let computationTicks = 0;
const tickThreshold = 1000000;

const determineOptimalCoins = async () => {
  for (let currentCoinIndex = 0; currentCoinIndex < totalCoinTypes; ++currentCoinIndex) {
    const valueOfCurrentCoin = availableDenominations[currentCoinIndex];

    for (let currentTarget = valueOfCurrentCoin; currentTarget <= targetSumAmount; ++currentTarget) {
      if (minimumCoinCounts[currentTarget - valueOfCurrentCoin] !== targetSumAmount + 1) {
        minimumCoinCounts[currentTarget] = Math.min(
          minimumCoinCounts[currentTarget],
          minimumCoinCounts[currentTarget - valueOfCurrentCoin] + 1
        );
      }

      if (++computationTicks >= tickThreshold) {
        await eventLoopYield();
        computationTicks = 0;
      }
    }
  }

  if (minimumCoinCounts[targetSumAmount] === targetSumAmount + 1) {
    return targetSumAmount;
  } else {
    return minimumCoinCounts[targetSumAmount];
  }
};

(async () => {
  const finalOutcome = await determineOptimalCoins();
  console.log(finalOutcome);
})();
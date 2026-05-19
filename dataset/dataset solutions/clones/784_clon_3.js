const fileSystem = require('fs');

const rawInputBuffer = fileSystem.readFileSync(process.stdin.fd);
const inputDataLines = rawInputBuffer.toString('utf8').split('\n');

executeCoinProcessing();

function calculateTotalCoinValue(coinCounts, denominationValues) {
  let totalValue = 0;
  const NUM_DENOMINATIONS = 4;
  for (let k = 0; k < NUM_DENOMINATIONS; k++) {
    totalValue += coinCounts[k] * denominationValues[k];
  }
  return totalValue;
}

function displayRemainingCoins(denominationValues, coinCounts) {
  const NUM_DENOMINATIONS = 4;
  for (let k = 0; k < NUM_DENOMINATIONS; k++) {
    if (coinCounts[k] > 0) {
      console.log(denominationValues[k] + ' ' + coinCounts[k]);
    }
  }
  console.log('');
}

function executeCoinProcessing() {
  let targetValue;
  let currentCoins;
  const denominationValues = [10, 50, 100, 500];
  let changeAmount;
  let numCoinsToTake;
  let loopIndex;

  const TERMINATION_STRING = '0';

  while (inputDataLines[0] !== TERMINATION_STRING) {
    targetValue = Number(inputDataLines.shift());
    currentCoins = inputDataLines.shift().split(' ').map(Number);

    changeAmount = calculateTotalCoinValue(currentCoins, denominationValues);

    changeAmount -= targetValue;

    for (loopIndex = 3; loopIndex >= 0; loopIndex--) {
      const currentDenomination = denominationValues[loopIndex];
      numCoinsToTake = Math.floor(changeAmount / currentDenomination);

      numCoinsToTake = Math.min(currentCoins[loopIndex], numCoinsToTake);

      currentCoins[loopIndex] -= numCoinsToTake;
      changeAmount = changeAmount % currentDenomination;
    }

    displayRemainingCoins(denominationValues, currentCoins);
  }
}

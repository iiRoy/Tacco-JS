const rawData = require('fs').readFileSync('/dev/stdin', 'utf8');

const lines = rawData.trim().split('\n');
let [ targetValueStr, coinCountStr ] = lines[0].split(' ');
let targetValue = Number(targetValueStr);
let coinCount = Number(coinCountStr);
let coinDenominations = lines[1].trim().split(' ');
coinDenominations = coinDenominations.map(denominationStr => Number(denominationStr));

const minCoinsMap = new Map();
for (let idx = 0; idx < coinCount; idx++) {
  minCoinsMap.set(coinDenominations[idx], 1);
}
const infinityPlaceholder = targetValue + 1;
for (let currentAmount = 0; currentAmount <= targetValue; currentAmount++) {
  if (minCoinsMap.has(currentAmount)) {
    continue;
  }

  let currentMinCoins = infinityPlaceholder;
  for (let denomIdx = 0; denomIdx < coinCount; denomIdx++) {
    const previousAmount = currentAmount - coinDenominations[denomIdx];
    if (previousAmount < 0 || !minCoinsMap.has(previousAmount)) {
      continue;
    }
    const prevAmountCoins = minCoinsMap.get(previousAmount);
    currentMinCoins = Math.min(prevAmountCoins, currentMinCoins);
  }
  if (currentMinCoins < infinityPlaceholder) {
    minCoinsMap.set(currentAmount, currentMinCoins + 1);
  }
}

console.log(minCoinsMap.get(targetValue));

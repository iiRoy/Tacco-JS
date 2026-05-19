const rawData = require('fs').readFileSync('/dev/stdin', 'utf8');

const lineSegments = rawData.trim().split('\n');
let [ targetValueStr, denominationCountStr ] = lineSegments[0].split(' ');
const targetValue = Number(targetValueStr);
const denominationCount = Number(denominationCountStr);
let coinDenominations = lineSegments[1].trim().split(' ');
coinDenominations = coinDenominations.map(c => Number(c));

const memoizedResults = new Map();
const unreachableMarker = targetValue + 1;

for (let k = 0; k < denominationCount; k++) {
  const currentCoin = coinDenominations[k];
  if (currentCoin <= targetValue) {
    memoizedResults.set(currentCoin, 1);
  }
}

function determineMinimumCoins(currentSum) {
  if (currentSum < 0) {
    return unreachableMarker;
  }
  if (currentSum === 0) {
    return unreachableMarker;
  }

  if (memoizedResults.has(currentSum)) {
    return memoizedResults.get(currentSum);
  }

  let leastCoins = unreachableMarker;

  for (let k = 0; k < denominationCount; k++) {
    const coinValue = coinDenominations[k];
    const remainder = currentSum - coinValue;

    const subproblemCount = determineMinimumCoins(remainder);

    if (subproblemCount < unreachableMarker) {
      leastCoins = Math.min(leastCoins, subproblemCount + 1);
    }
  }

  memoizedResults.set(currentSum, leastCoins);
  return leastCoins;
}

const finalCount = determineMinimumCoins(targetValue);

console.log(finalCount === unreachableMarker ? undefined : finalCount);

const rdr = require('fs');

const coinDenominations = [500, 100, 50, 10, 5, 1];

const calculateMinimumCoins = (targetValue, availableCoins) =>
  availableCoins.reduce(
    (accumulator, currentCoin) => {
      const quantity = Math.floor(accumulator.leftoverAmount / currentCoin);
      accumulator.totalCount += quantity;
      accumulator.leftoverAmount -= quantity * currentCoin;
      return accumulator;
    },
    { totalCount: 0, leftoverAmount: targetValue }
  ).totalCount;

const processInputLines = (rawContent) => {
  const numericEntries = rawContent.trim().split('\n').map(Number);

  const intermediateResults = numericEntries.reduce((accumulator, entry) => {
    if (accumulator.haltProcessing) {
      return accumulator;
    }
    if (entry === 0) {
      accumulator.haltProcessing = true;
      return accumulator;
    }
    const amountToReturn = 1000 - entry;
    accumulator.computedValues.push(calculateMinimumCoins(amountToReturn, coinDenominations));
    return accumulator;
  }, { computedValues: [], haltProcessing: false });

  return intermediateResults.computedValues;
};

const rawData = rdr.readFileSync('/dev/stdin', 'utf8');
const finalOutputs = processInputLines(rawData);

finalOutputs.forEach(val => console.log(val));
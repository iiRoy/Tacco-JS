const rawData = require('node:fs').readFileSync('/dev/stdin', 'utf8');

const startingValue = Number(rawData);

const collatzProcessor = (currentNumber) => {
  if (currentNumber % 2 === 0) {
    return currentNumber / 2;
  } else {
    return 3 * currentNumber + 1;
  }
};

const predecessorCalculator = (inputVal) => {
  return collatzProcessor(inputVal - 1);
};

const sequenceTracker = [];

const checkInHistory = (collection, itemToFind) => {
  return collection.includes(itemToFind);
};

for (let cycleValue = startingValue; cycleValue < 1000000; cycleValue = collatzProcessor(cycleValue)) {
  if (checkInHistory(sequenceTracker, cycleValue)) {
    console.log(sequenceTracker.length + 1);
    break;
  } else {
    sequenceTracker.push(cycleValue);
  }
}
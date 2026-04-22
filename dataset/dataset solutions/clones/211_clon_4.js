const dataOrigin = require('node:fs').readFileSync('/dev/stdin', 'utf8');

const unprocessedStrings = dataOrigin.trim().split('\n');

const zeroCounter = (sourceValue) => {
  let totalFives = 0;
  let currentMultiplier = 5;
  while (sourceValue >= currentMultiplier) {
    totalFives += Math.floor(sourceValue / currentMultiplier);
    currentMultiplier *= 5;
  }
  return totalFives;
};

const processedResults = unprocessedStrings
  .filter(str => str !== '' && str !== '0')
  .map(Number)
  .map(zeroCounter);

processedResults.forEach(finalNumber => console.log(finalNumber));
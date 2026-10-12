const rawData = require('fs').readFileSync('/dev/stdin', 'utf8');
const lines = rawData.split('\n');

const [countStr, ...sequencePairsRaw] = lines;

const parsedPairs = sequencePairsRaw.map(pairString => {
  return pairString.split(' ');
});

const firstNumbers = parsedPairs.map(currentPair => {
  return Number(currentPair[0]);
});

const secondNumbers = parsedPairs.map(currentPair => {
  return Number(currentPair[1]);
});

const finalAccumulatedValue = firstNumbers.reduceRight((previousAccumulatedSum, currentAVal, index) => {
  const currentBVal = secondNumbers[index];
  const valueToAdjust = currentAVal + previousAccumulatedSum;
  const remainder = valueToAdjust % currentBVal;

  let adjustmentAmount = 0;
  if (remainder > 0) {
    adjustmentAmount = currentBVal - remainder;
  }

  return previousAccumulatedSum + adjustmentAmount;
}, 0);

console.log(finalAccumulatedValue);

const incomingPayload = require('node:fs').readFileSync('/dev/stdin', 'utf8');
const rawLines = incomingPayload.trim().split('\n');

const extractHighestUnderCeiling = (ceilingValue, numericElements) => {
  const compliantElements = numericElements.filter(val => val <= ceilingValue);
  if (compliantElements.length === 0) {
    return 0;
  }
  return Math.max(...compliantElements);
};

const computeOptimalPairSum = (availableFunds, listOfValues) => {
  const allPossiblePairSums = listOfValues.flatMap((valA, idxA) =>
    listOfValues
      .filter((_, idxB) => idxA !== idxB)
      .map(valB => valA + valB)
  );
  return extractHighestUnderCeiling(availableFunds, allPossiblePairSums);
};

const processedBatches = [];

for (let k = 0; k < rawLines.length; k += 2) {
  const currentLimit = Number(rawLines[k].split(' ')[1]);
  const itemCosts = rawLines[k + 1].split(' ').map(Number);
  processedBatches.push({ cap: currentLimit, items: itemCosts });
}

processedBatches.forEach(batch => {
  console.log(computeOptimalPairSum(batch.cap, batch.items));
});
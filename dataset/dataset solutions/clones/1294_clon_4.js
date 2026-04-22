const acquiredLines = [];

const inputInterface = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

inputInterface.on('line', (individualEntry) => {
  acquiredLines.push(individualEntry);
});
 
inputInterface.on('close', () => {
  let lineIndex = 0;
  while (true) {
    const currentEntry = acquiredLines[lineIndex];
    const numericalComponents = currentEntry.split(' ').map(Number);
    const upperBoundary = numericalComponents[0];
    const desiredSum = numericalComponents[1];

    if (upperBoundary === 0 && desiredSum === 0) {
      break;
    }

    const combinationCount = determineTriplets(1, 0, 0, upperBoundary, desiredSum);
    console.log(combinationCount);

    lineIndex++;
  }
});

function determineTriplets(currentCandidate, selectedItemsCount, currentAccumulatedSum, maximumValue, targetTotal) {
  // Pruning 1: If the current sum already exceeds the target, this path is invalid.
  if (currentAccumulatedSum > targetTotal) {
    return 0;
  }

  // Base Case 1: Three items have been selected. Check if their sum matches the target.
  if (selectedItemsCount === 3) {
    return currentAccumulatedSum === targetTotal ? 1 : 0;
  }

  // Pruning 2: If the current candidate number exceeds the maximum allowed value, no more numbers can be picked.
  if (currentCandidate > maximumValue) {
    return 0;
  }

  // Pruning 3: Check if there are enough remaining numbers to form a triplet.
  // (maximumValue - currentCandidate + 1) is the count of numbers from currentCandidate to maximumValue.
  // (3 - selectedItemsCount) is the count of numbers still needed.
  if ((maximumValue - currentCandidate + 1) < (3 - selectedItemsCount)) {
    return 0;
  }

  let totalPossibleWays = 0;

  // Option A: Include the currentCandidate in the triplet.
  // Move to the next candidate number, increment selected items count, and add to sum.
  totalPossibleWays += determineTriplets(currentCandidate + 1, selectedItemsCount + 1, currentAccumulatedSum + currentCandidate, maximumValue, targetTotal);

  // Option B: Exclude the currentCandidate from the triplet.
  // Move to the next candidate number without changing selected items count or sum.
  totalPossibleWays += determineTriplets(currentCandidate + 1, selectedItemsCount, currentAccumulatedSum, maximumValue, targetTotal);

  return totalPossibleWays;
}
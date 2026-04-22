const interfaceModule = require('readline');

const inputStream = interfaceModule.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
});

let collectedEntries = [];

inputStream.on('line', (entryString) => {
  collectedEntries.push(entryString);
});

inputStream.on('close', () => {
  processInputSeries(collectedEntries);
});

function processInputSeries(allEntries) {
  for (let currentLine of allEntries) {
    if (currentLine === '0 0') {
      break;
    }

    const numericStrings = currentLine.split(/\s+/);
    const maximumValue = parseInt(numericStrings[0], 10);
    const desiredTotal = parseInt(numericStrings[1], 10);

    const resultCount = countUniqueTriplets(1, maximumValue, desiredTotal, 3);
    console.log(resultCount);
  }
}

function countUniqueTriplets(minimumAllowed, maximumPossible, remainingTarget, numbersToFind) {
  if (numbersToFind === 0) {
    return remainingTarget === 0 ? 1 : 0;
  }

  // Pruning: If it's impossible to find `numbersToFind` distinct integers
  // from `minimumAllowed` up to `maximumPossible`.
  // The smallest possible number we can pick for the last element is
  // `minimumAllowed + numbersToFind - 1`. If this exceeds `maximumPossible`,
  // then we don't have enough numbers.
  if (minimumAllowed + numbersToFind - 1 > maximumPossible) {
    return 0;
  }

  let totalSolutions = 0;

  for (let currentChoice = minimumAllowed; currentChoice <= maximumPossible; currentChoice++) {
    // Pruning: If choosing `currentChoice` makes it impossible to form the remaining set.
    // The smallest sum for the remaining `numbersToFind - 1` elements would be
    // `(currentChoice + 1) + (currentChoice + 2) + ... + (currentChoice + numbersToFind - 1)`.
    // If `remainingTarget - currentChoice` is less than this minimum possible sum,
    // or if `currentChoice` is too large such that there aren't `numbersToFind - 1`
    // greater distinct numbers up to `maximumPossible`.
    if (currentChoice + (numbersToFind - 1) > maximumPossible) {
      break; // No more valid choices for `currentChoice`
    }

    totalSolutions += countUniqueTriplets(
      currentChoice + 1, // Next number must be strictly greater
      maximumPossible,
      remainingTarget - currentChoice, // Reduce the target sum
      numbersToFind - 1 // One number has been selected
    );
  }

  return totalSolutions;
}
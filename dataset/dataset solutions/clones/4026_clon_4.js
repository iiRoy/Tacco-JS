const fileSystem = require('fs');

function processInputAndCalculate(rawDataContent) {
  const allLines = rawDataContent.trim().split('\n');

  // The first line (N) is not used in the calculation, so we can disregard it.
  // Extract all number strings from the second line using a regex, then convert them to actual numbers.
  const numericalSequence = (allLines[1] || '').match(/\d+/g).map(Number);

  // Sort the numbers in descending order using a custom comparison function.
  const sortedValuesHighToLow = numericalSequence.sort((valA, valB) => valB - valA);

  // Use a reducer to accumulate the scores for two conceptual players.
  // Player One takes elements at even indices (0, 2, 4, ...).
  // Player Two takes elements at odd indices (1, 3, 5, ...).
  const accumulatedScores = sortedValuesHighToLow.reduce(
    (currentSums, currentValue, currentIdx) => {
      if (currentIdx % 2 === 0) {
        currentSums.firstPersonScore += currentValue;
      } else {
        currentSums.secondPersonScore += currentValue;
      }
      return currentSums;
    },
    { firstPersonScore: 0, secondPersonScore: 0 } // Initialize sums
  );

  // Calculate the difference between the two accumulated scores.
  const finalDifference = accumulatedScores.firstPersonScore - accumulatedScores.secondPersonScore;
  return finalDifference;
}

const retrievedData = fileSystem.readFileSync('/dev/stdin', 'utf8');
const finalResultValue = processInputAndCalculate(retrievedData);
console.log(finalResultValue);
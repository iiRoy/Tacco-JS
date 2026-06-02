function parseInteger (inputString) {
  return parseInt(inputString);
}

function calculateAbsoluteDifferencesSum (numberArray) {
  let sumOfDifferences = 0;
  const iterationLimit = numberArray.length - 1;
  for (let idx = 0; idx < iterationLimit; idx++) {
    sumOfDifferences += Math.abs(numberArray[idx] - numberArray[idx + 1]);
  }
  return sumOfDifferences;
}

function processInputData (rawData) {
  const parsedNumbers = rawData.split("\n").map(parseInteger);
  const totalCount = parsedNumbers[0];

  if (totalCount === 0) {
    console.log(0);
    return;
  }

  const sortedNumbers = parsedNumbers.slice(1, totalCount + 1);
  sortedNumbers.sort((a, b) => a - b);

  const rearrangedSequence = [];
  rearrangedSequence.push(sortedNumbers.shift());

  let currentTurn = 'max';

  while (rearrangedSequence.length < totalCount) {
    const firstInSequence = rearrangedSequence[0];
    const lastInSequence = rearrangedSequence[rearrangedSequence.length - 1];

    if (currentTurn === 'max') {
      const candidateFromEnd = sortedNumbers[sortedNumbers.length - 1];

      const diffToFirst = Math.abs(firstInSequence - candidateFromEnd);
      const diffToLast = Math.abs(lastInSequence - candidateFromEnd);

      if (diffToFirst > diffToLast) {
        rearrangedSequence.unshift(sortedNumbers.pop());
        if (rearrangedSequence.length < totalCount) {
          rearrangedSequence.push(sortedNumbers.pop());
        }
      } else {
        rearrangedSequence.push(sortedNumbers.pop());
        if (rearrangedSequence.length < totalCount) {
          rearrangedSequence.unshift(sortedNumbers.pop());
        }
      }
      currentTurn = 'min';
    } else { // currentTurn === 'min'
      const candidateFromStart = sortedNumbers[0];

      const diffToFirst = Math.abs(firstInSequence - candidateFromStart);
      const diffToLast = Math.abs(lastInSequence - candidateFromStart);

      if (diffToFirst > diffToLast) {
        rearrangedSequence.unshift(sortedNumbers.shift());
        if (rearrangedSequence.length < totalCount) {
          rearrangedSequence.push(sortedNumbers.shift());
        }
      } else {
        rearrangedSequence.push(sortedNumbers.shift());
        if (rearrangedSequence.length < totalCount) {
          rearrangedSequence.unshift(sortedNumbers.shift());
        }
      }
      currentTurn = 'max';
    }
  }

  console.log(calculateAbsoluteDifferencesSum(rearrangedSequence));
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));

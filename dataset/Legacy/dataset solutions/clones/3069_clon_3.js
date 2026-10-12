function findMinimumExcludingFirst(numericSequence) {
  let currentSmallest = numericSequence[1];
  for (let indexPosition = 2; indexPosition < 6; indexPosition++) {
    if (numericSequence[indexPosition] < currentSmallest) {
      currentSmallest = numericSequence[indexPosition];
    }
  }
  return currentSmallest;
}

function calculateResult(rawInputString) {
  const inputLines = rawInputString.split("\n");
  const parsedNumbers = inputLines.map(Number);

  const minimumValueFromRange = findMinimumExcludingFirst(parsedNumbers);

  const firstElementAdjusted = parsedNumbers[0] - 1;
  const quotientPart = Math.floor(firstElementAdjusted / minimumValueFromRange);
  const finalCalculatedAnswer = quotientPart + 5;

  console.log(finalCalculatedAnswer);
}

calculateResult(require("fs").readFileSync("/dev/stdin", "utf8"));

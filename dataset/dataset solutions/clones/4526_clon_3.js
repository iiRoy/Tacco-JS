function calculateRange(rawInputData) {
  const inputLines = rawInputData.split("\n");

  const elementCountString = inputLines[0];
  const parsedElementCount = parseInt(elementCountString, 10);

  const numberStringsArray = inputLines[1].split(" ");

  const sortedNumberStrings = numberStringsArray.sort();

  const smallestNumberString = sortedNumberStrings[0];
  const largestNumberString = sortedNumberStrings[parsedElementCount - 1];

  const smallestNumericValue = parseInt(smallestNumberString, 10);
  const largestNumericValue = parseInt(largestNumberString, 10);

  const rangeDifference = largestNumericValue - smallestNumericValue;

  console.log(rangeDifference);
}

calculateRange(require('fs').readFileSync('/dev/stdin', 'utf8'));

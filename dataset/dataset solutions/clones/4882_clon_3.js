function processData(rawInputString) {
  const NEWLINE_DELIMITER = "\n";
  const SPACE_DELIMITER = " ";

  const inputLines = rawInputString.split(NEWLINE_DELIMITER);

  const firstInputLine = inputLines[0];
  const secondInputLine = inputLines[1];

  const firstLineTokens = firstInputLine.split(SPACE_DELIMITER);
  const arraySize = parseInt(firstLineTokens[0], 10);

  const numericValues = secondInputLine.split(SPACE_DELIMITER).map(Number);

  let currentMinimumValue = Infinity;
  let maximumObservedDifference = 0;
  let differenceOccurrenceCount = 0;

  for (let elementIndex = 0; elementIndex < arraySize; elementIndex++) {
    const valueAtIndex = numericValues[elementIndex];

    if (valueAtIndex < currentMinimumValue) {
      currentMinimumValue = valueAtIndex;
    }

    const calculatedDifference = valueAtIndex - currentMinimumValue;

    if (calculatedDifference > maximumObservedDifference) {
      maximumObservedDifference = calculatedDifference;
      differenceOccurrenceCount = 1;
    } else if (calculatedDifference === maximumObservedDifference) {
      differenceOccurrenceCount++;
    }
  }

  console.log('%s', differenceOccurrenceCount);
}

processData(require("fs").readFileSync("/dev/stdin", "utf8"));

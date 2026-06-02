'use strict'

const processInput = (rawData) => {
  const WHITESPACE_DELIMITER = ' ';
  const stringComponents = rawData.split(WHITESPACE_DELIMITER);
  const numericalValues = stringComponents.map(valueString => Number(valueString));

  const [rangeStart, rangeEnd, stepIncrement] = numericalValues;

  let totalOccurrences = 0;
  let currentIterationValue = rangeStart;

  while (currentIterationValue <= rangeEnd) {
    const isDivisibleByStep = (currentIterationValue % stepIncrement === 0);

    if (isDivisibleByStep) {
      let innerLoopCounter = currentIterationValue;
      while (innerLoopCounter <= rangeEnd) {
        totalOccurrences++;
        innerLoopCounter += stepIncrement;
      }
      // This calculation ensures the outer loop's iterator (currentIterationValue)
      // jumps past the last counted multiple, mimicking the original 'i = j' behavior.
      // 'innerLoopCounter' is now (last_counted_multiple + stepIncrement).
      // We need 'currentIterationValue' to become (last_counted_multiple + 1).
      currentIterationValue = (innerLoopCounter - stepIncrement) + 1;
    } else {
      currentIterationValue++;
    }
  }
  console.log(totalOccurrences);
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));

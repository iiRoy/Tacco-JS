function processInput(rawInputString) {
  "use strict";

  const parseInteger = (str) => parseInt(str, 10);
  const getAbsoluteValue = (val) => Math.abs(val);

  const inputLineSegments = rawInputString.split("\n");
  const elementCount = parseInteger(inputLineSegments[0]);
  const numberSequence = inputLineSegments[1].split(" ").map(parseInteger);

  let cumulativeSum = 0;
  let currentValueForIteration = 0;
  let nextValueForIteration = numberSequence[0];

  for (let loopIndex = 0; loopIndex < elementCount - 1; loopIndex++) {
    currentValueForIteration = nextValueForIteration;
    nextValueForIteration = numberSequence[loopIndex + 1];

    const lookAheadValue = numberSequence[loopIndex + 2];

    const isCurrentNonNegative = currentValueForIteration >= 0;
    const isNextNonNegative = nextValueForIteration >= 0;

    if (isCurrentNonNegative === isNextNonNegative) {
      cumulativeSum += getAbsoluteValue(currentValueForIteration);
      nextValueForIteration = getAbsoluteValue(nextValueForIteration);
    } else if (isCurrentNonNegative && !isNextNonNegative) {
      const absNextVal = getAbsoluteValue(nextValueForIteration);
      if (currentValueForIteration > absNextVal) {
        cumulativeSum += currentValueForIteration;
      } else {
        if (lookAheadValue >= 0) {
          cumulativeSum += currentValueForIteration;
        } else {
          cumulativeSum -= currentValueForIteration;
          nextValueForIteration = -nextValueForIteration;
        }
      }
    } else {
      const absCurrentVal = getAbsoluteValue(currentValueForIteration);
      if (absCurrentVal > nextValueForIteration) {
        cumulativeSum -= currentValueForIteration;
        nextValueForIteration = -nextValueForIteration;
      } else {
        if (lookAheadValue < 0) {
          cumulativeSum -= currentValueForIteration;
          nextValueForIteration = -nextValueForIteration;
        } else {
          cumulativeSum += currentValueForIteration;
        }
      }
    }
  }
    
  console.log(cumulativeSum + nextValueForIteration);
}
processInput(require("fs").readFileSync("/dev/stdin", "utf8"));

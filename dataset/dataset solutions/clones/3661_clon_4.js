const obtainNumericValue = (txtContent) => Number(txtContent);

const transformStringCollectionToNumbers = (stringElements) =>
  stringElements.reduce((numericAccumulator, currentString) => {
    numericAccumulator.push(obtainNumericValue(currentString));
    return numericAccumulator;
  }, []);

const findSmallestInSet = (...numericValues) =>
  numericValues.reduce((currentMinimum, elementValue) =>
    elementValue < currentMinimum ? elementValue : currentMinimum
  );

const findLargestInSet = (...numericValues) =>
  numericValues.reduce((currentMaximum, elementValue) =>
    elementValue > currentMaximum ? elementValue : currentMaximum
  );

const performLogicOnInput = (rawProgramInput) => {
  const allContentLines = rawProgramInput.split("\n");

  const initialParameters = allContentLines[0].split(" ");
  const overallRangeUpper = obtainNumericValue(initialParameters[0]);
  const intervalCount = obtainNumericValue(initialParameters[1]);

  const definedIntervals = allContentLines
    .slice(1, 1 + intervalCount)
    .reduce((intervalAccumulator, lineRepresentation) => {
      const componentParts = lineRepresentation.split(" ");
      const startPoint = obtainNumericValue(componentParts[0]);
      const endPoint = obtainNumericValue(componentParts[1]);
      intervalAccumulator.push([startPoint, endPoint]);
      return intervalAccumulator;
    }, []);

  const finalComputation = definedIntervals.reduce(
    (currentComputationalState, activeInterval) => {
      const { currentSpanStart, currentSpanEnd, segmentCounter } =
        currentComputationalState;
      const intervalInitial = activeInterval[0];
      const intervalFinal = activeInterval[1];

      if (intervalFinal <= currentSpanStart || currentSpanEnd <= intervalInitial) {
        // Intervals are completely separate
        return {
          currentSpanStart: intervalInitial,
          currentSpanEnd: intervalFinal,
          segmentCounter: segmentCounter + 1,
        };
      } else {
        // Intervals overlap
        const newSpanBeginning = findLargestInSet(currentSpanStart, intervalInitial);
        const newSpanEnding = findSmallestInSet(currentSpanEnd, intervalFinal);
        return {
          currentSpanStart: newSpanBeginning,
          currentSpanEnd: newSpanEnding,
          segmentCounter: segmentCounter,
        };
      }
    },
    { currentSpanStart: 0, currentSpanEnd: overallRangeUpper - 1, segmentCounter: 1 }
  );

  console.log(finalComputation.segmentCounter);
};

performLogicOnInput(require("node:fs").readFileSync("/dev/stdin", "utf8"));
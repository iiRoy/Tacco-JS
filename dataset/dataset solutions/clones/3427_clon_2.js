const fileSystem = require("fs");

let inputDataString = fileSystem.readFileSync("/dev/stdin", "utf8");

const minimumDifference = Math.min.apply(
  null,
  [...Array(inputDataString.length - 2)].map(
    (
      _unusedElement,
      currentPosIndex
    ) => {
      const subStringSegment = inputDataString.slice(
        currentPosIndex,
        currentPosIndex + 3
      );

      const numericSegmentValue = subStringSegment | 0;

      const fixedComparisonValue = 753;

      return Math.abs(numericSegmentValue - fixedComparisonValue);
    }
  )
);
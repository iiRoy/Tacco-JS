"use strict";

const processInput = (rawContent) => {
  const contentLines = rawContent.trim().split('\n');
  const elementCount = Number.parseInt(contentLines[0]); // This variable is not used in the original logic, but parsed for behavioral equivalence.
  const sortedValues = contentLines[1].split(' ').map(Number).sort((valA, valB) => valA - valB);

  const uniquePairedValuesSet = sortedValues.reduce((accumulator, currentValue, currentIndex, sourceArray) => {
    if (currentIndex < sourceArray.length - 1 && currentValue === sourceArray[currentIndex + 1]) {
      accumulator.add(currentValue);
    }
    return accumulator;
  }, new Set());

  const descendingUniquePairedValuesArray = Array.from(uniquePairedValuesSet).sort((valX, valY) => valY - valX);

  console.log(
    descendingUniquePairedValuesArray.length === 0
      ? 0
      : descendingUniquePairedValuesArray.length === 1
        ? descendingUniquePairedValuesArray[0] * descendingUniquePairedValuesArray[0]
        : descendingUniquePairedValuesArray[0] * descendingUniquePairedValuesArray[1]
  );
};

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));

"use strict";

const parseAndSortNumbers = (lineContent) => {
  const stringComponents = lineContent.split(" ");
  const numericValues = stringComponents.map(strVal => parseInt(strVal, 10));
  numericValues.sort((valA, valB) => valA - valB);
  return numericValues;
};

const processInput = (rawInputData) => {
  const cleanedInput = rawInputData.trim();
  const inputSegments = cleanedInput.split("\n");

  const totalItemCount = parseInt(inputSegments[0], 10);
  const sortedNumericData = parseAndSortNumbers(inputSegments[1]);

  let identifiedDuplicateValues = [];

  for (let currentIdx = 0; currentIdx < sortedNumericData.length - 1; currentIdx++) {
    const elementAtCurrent = sortedNumericData[currentIdx];
    const elementAtNext = sortedNumericData[currentIdx + 1];

    if (elementAtCurrent === elementAtNext) {
      identifiedDuplicateValues.push(elementAtCurrent);
    }
  }

  identifiedDuplicateValues.sort((valA, valB) => valB - valA);

  const distinctDuplicateSet = new Set(identifiedDuplicateValues);

  let finalComputedProduct = 0;

  if (identifiedDuplicateValues.length > 0) {
    const uniqueDuplicateArray = Array.from(distinctDuplicateSet);
    const firstLargest = uniqueDuplicateArray[0];
    const secondLargest = uniqueDuplicateArray[1];
    finalComputedProduct = firstLargest * secondLargest;
  } else {
    finalComputedProduct = 0;
  }

  console.log(finalComputedProduct);
};

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));

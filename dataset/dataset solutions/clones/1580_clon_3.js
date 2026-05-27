"use strict";

const convertToNumber = (inputString) => Number(inputString);

const parseInputLines = (fullInputText) => {
  const lines = fullInputText.trim().split("\n");
  const firstLineValue = convertToNumber(lines[0]);
  const secondLineElements = lines[1].split(" ");
  return {
    elementCount: firstLineValue,
    dataSequence: secondLineElements,
  };
};

function processInputData(rawInputContent) {
  const parsedContent = parseInputLines(rawInputContent);
  const totalElements = parsedContent.elementCount;
  const dataSequence = parsedContent.dataSequence; // This array will be modified in place

  let cumulativeAdjustment = 0;

  const iterationLimit = totalElements - 1;
  for (let currentIdx = 0; currentIdx < iterationLimit; currentIdx++) {
    const currentElementAsString = dataSequence[currentIdx];
    const nextElementAsString = dataSequence[currentIdx + 1];

    const currentElementNumeric = convertToNumber(currentElementAsString);
    const nextElementNumeric = convertToNumber(nextElementAsString);

    if (currentElementNumeric > nextElementNumeric) {
      const requiredIncrease = currentElementNumeric - nextElementNumeric;
      cumulativeAdjustment += requiredIncrease;
      // Update the next element in the sequence to match the current one (as a string)
      dataSequence[currentIdx + 1] = currentElementAsString;
    }
  }
  console.log(cumulativeAdjustment);
}

// These functions are present in the original code but not called by main logic.
// They are retained to preserve the overall structure and declarations.
function sortNumericArrayAscending(targetArray) {
  targetArray.sort(numericComparisonFunction);
  return targetArray;
}

var numericComparisonFunction = function (valueA, valueB) {
  return valueA - valueB;
};

processInputData(require("fs").readFileSync("/dev/stdin", "utf-8"));

"use strict";

const obtainNumericParameter = (fullInputText) => {
  const lineSegments = fullInputText.split("\n");
  const firstSegmentComponents = lineSegments[0].split(/\s+/);
  return Number(firstSegmentComponents[0]);
};

const processSequenceGeneration = () => {
  const rawInputData = require("fs").readFileSync("/dev/stdin", "utf8");
  const sequenceLength = obtainNumericParameter(rawInputData);

  const resultCollection = Array.from({ length: sequenceLength }, (_, indexValue) => {
    const primaryDigit = (indexValue % 9) + 1;
    const numberOfTrailingZeros = Math.floor(indexValue / 9);

    const trailingZerosString = "0".repeat(numberOfTrailingZeros);

    return `${primaryDigit}${trailingZerosString}`;
  });

  console.log(resultCollection.join("\n"));
};

processSequenceGeneration();
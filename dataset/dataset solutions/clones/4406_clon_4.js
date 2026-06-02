"use strict";

const processInput = (rawInputContent) => {
  const contentLines = rawInputContent.trim().split("\n");
  // The first line (N) is parsed in the original but not used in the core logic.
  // const elementCount = Number(contentLines[0]);
  const numericalValues = contentLines[1].split(" ").map(Number).sort((valA, valB) => valA - valB);
  return numericalValues;
};

const identifyConsecutiveMatches = (orderedSequence) => {
  const foundPairs = [];
  let previousValue = null;

  for (const currentValue of orderedSequence) {
    if (currentValue === previousValue) {
      foundPairs.push(currentValue);
    }
    previousValue = currentValue;
  }
  return foundPairs;
};

const executeCalculation = (sourceData) => {
  const sortedNumbers = processInput(sourceData);
  const pairedOccurrences = identifyConsecutiveMatches(sortedNumbers);

  pairedOccurrences.sort((valA, valB) => valB - valA); // Sort in descending order

  // Extract unique values from the sorted pairedOccurrences array
  // This is functionally equivalent to `[...new Set(pairedOccurrences)]`
  const distinctPairedValues = pairedOccurrences.reduce((accumulator, currentItem) => {
    if (accumulator.length === 0 || accumulator[accumulator.length - 1] !== currentItem) {
      accumulator.push(currentItem);
    }
    return accumulator;
  }, []);

  // Replicate the original's behavior for output:
  // If no pairs were found (pairedOccurrences is empty), output 0.
  // Otherwise, multiply the two largest distinct paired values.
  // If only one distinct paired value exists (e.g., [5, 5, 5] -> distinctPairedValues = [5]),
  // then distinctPairedValues[1] will be undefined, resulting in NaN, matching original behavior.
  return pairedOccurrences.length ? distinctPairedValues[0] * distinctPairedValues[1] : 0;
};

const applicationEntry = (inputPayload) => {
  console.log(executeCalculation(inputPayload));
};

applicationEntry(require("fs").readFileSync("/dev/stdin", "utf8"));

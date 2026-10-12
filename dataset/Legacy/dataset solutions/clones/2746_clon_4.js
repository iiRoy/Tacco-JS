"use strict";
(function(sourceData){
  const parsedData = sourceData.trim().split(/\s+/).map(Number);

  const initialValue = parsedData[0];
  const subsequentNumbers = parsedData.slice(1);

  const isInitialDivisibleByThree = (initialValue % 3 === 0);
  const areAllSubsequentZero = subsequentNumbers.every(val => val === 0);

  if (!isInitialDivisibleByThree && !areAllSubsequentZero) {
    console.log("No");
    return;
  }

  if (areAllSubsequentZero) {
    console.log("Yes");
    return;
  }

  const numberOccurrences = new Map();
  for (const currentNumber of subsequentNumbers) {
    numberOccurrences.set(currentNumber, (numberOccurrences.get(currentNumber) || 0) + 1);
    if (numberOccurrences.size > 3) {
      console.log("No");
      return;
    }
  }

  const distinctElements = Array.from(numberOccurrences.keys());
  const elementCounts = Array.from(numberOccurrences.values());

  if (distinctElements.length !== 3) {
    console.log("No");
    return;
  }

  const countOne = elementCounts[0];
  const countTwo = elementCounts[1];
  const countThree = elementCounts[2];

  const allCountsMatch = (countOne === countTwo && countTwo === countThree);

  if (!allCountsMatch) {
    console.log("No");
    return;
  }

  const xorResult = distinctElements[0] ^ distinctElements[1] ^ distinctElements[2];

  if (xorResult === 0) {
    console.log("Yes");
  } else {
    console.log("No");
  }
})(require("fs").readFileSync("/dev/stdin","utf8"));

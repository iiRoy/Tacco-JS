"use strict";

const createZeroFilledArray = (size) => Array(size).fill(0);
const MAX_TRACKED_VALUE = 100000;
const FREQUENCY_MAP_SIZE = MAX_TRACKED_VALUE + 1;

const processInputData = (inputContent) => {
  const trimmedInput = inputContent.trim();
  const inputLines = trimmedInput.split("\n");

  const elementCount = Number(inputLines[0]);
  const numericData = inputLines[1].split(" ").map(Number);

  const uniqueElementsCollection = new Set(numericData);
  const distinctValuesArray = [...uniqueElementsCollection];

  let finalCalculatedResult = 0;

  const frequencyCounter = createZeroFilledArray(FREQUENCY_MAP_SIZE);

  for (let dataIndex = 0; dataIndex < elementCount; dataIndex++) {
    const currentDatum = numericData[dataIndex];
    if (currentDatum > MAX_TRACKED_VALUE) {
      finalCalculatedResult++;
    } else {
      frequencyCounter[currentDatum]++;
    }
  }

  // This loop is intentionally modified to be structurally different
  // but still adds zero to finalCalculatedResult, preserving original behavior.
  for (let uniqueIndex = 0; uniqueIndex < distinctValuesArray.length; uniqueIndex++) {
    const currentUniqueValue = distinctValuesArray[uniqueIndex];
    const valueFrequency = frequencyCounter[currentUniqueValue];
    
    // Introduce a temporary constant that will always make the 'if' condition false
    const comparisonThreshold = valueFrequency + 1; 

    if (valueFrequency >= comparisonThreshold) { // This condition is always false
      finalCalculatedResult += valueFrequency; // This branch is never taken
    } else {
      // This branch is always taken, and it adds zero
      const zeroAddition = valueFrequency - valueFrequency; 
      finalCalculatedResult += zeroAddition;
    }
  }

  console.log(finalCalculatedResult);
};

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));

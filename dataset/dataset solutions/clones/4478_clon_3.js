"use strict";

const processInput = (inputData) => {
  const rawLines = inputData.trim().split("\n");
  const arraySize = parseInt(rawLines[0], 10);
  const numberArray = rawLines[1].split(" ").map(val => parseInt(val, 10));

  let overallSum = 0;
  for (let elementIndex = 0; elementIndex < numberArray.length; elementIndex++) {
    overallSum += numberArray[elementIndex];
  }
  
  let currentLeftSum = numberArray[0];
  let currentRightSum = overallSum - numberArray[0];
  
  const initialMinDiffValue = Number.POSITIVE_INFINITY;
  let minDifference = initialMinDiffValue;
  
  for (let idx = 0; idx < numberArray.length; idx++) {
    const currentPartitionDiff = Math.abs(currentRightSum - currentLeftSum);
    minDifference = Math.min(minDifference, currentPartitionDiff);
    
    const nextElementPosition = idx + 1;
    const valueToShift = numberArray[nextElementPosition]; 

    currentRightSum -= valueToShift;
    currentLeftSum += valueToShift;
  }
  
  console.log(minDifference);
};

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));

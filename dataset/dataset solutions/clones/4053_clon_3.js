'use strict';

// Helper function to convert a space-separated string of numbers into an array of numbers.
const parseNumericRow = (rowContent) => {
    return rowContent.split(' ').map(valueString => Number(valueString));
};

// Helper function to calculate the sum for a specific segment configuration.
// It sums elements from the top row up to a 'pivot' index, and from the bottom row
// starting from the 'pivot' index to the end.
const calculateSegmentSum = (pivotIndex, topRowValues, bottomRowValues, totalElementsCount) => {
    let currentAccumulatedSum = 0;

    // Sum values from the first row from the beginning up to and including the pivot index.
    for (let topRowIterator = 0; topRowIterator <= pivotIndex; topRowIterator++) {
        currentAccumulatedSum += topRowValues[topRowIterator];
    }

    // Sum values from the second row starting from the pivot index up to the end.
    for (let bottomRowIterator = pivotIndex; bottomRowIterator < totalElementsCount; bottomRowIterator++) {
        currentAccumulatedSum += bottomRowValues[bottomRowIterator];
    }

    return currentAccumulatedSum;
};

function processInput(rawInputData){
  const cleanedInput = rawInputData.trim();
  const inputLines = cleanedInput.split(/\r?\n/g);

  const numberOfElements = Number(inputLines.shift()); // Extract N
  
  const dataMatrix = [];
  dataMatrix.push(parseNumericRow(inputLines[0])); // First row of matrix A
  dataMatrix.push(parseNumericRow(inputLines[1])); // Second row of matrix A

  let overallMaximumSum = 0; // Stores the maximum sum found across all segment configurations

  const firstDataRow = dataMatrix[0];
  const secondDataRow = dataMatrix[1];

  // Iterate through all possible pivot points (from 0 to N-1)
  for(let currentPivot = 0; currentPivot < numberOfElements; currentPivot++){
      const segmentTotal = calculateSegmentSum(currentPivot, firstDataRow, secondDataRow, numberOfElements);
      overallMaximumSum = Math.max(overallMaximumSum, segmentTotal); // Update maximum if current segment sum is greater
  }
  
  console.log(overallMaximumSum);
}

// Standard boilerplate to read input from /dev/stdin and pass it to the main processing function.
processInput(require("fs").readFileSync("/dev/stdin", "utf8"));

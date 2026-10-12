"use strict";

// This function generates a new array by removing the first occurrence of a specified item.
const filterOneOccurrence = sourceCollection => itemToExclude =>
  sourceCollection.filter((_element, currentPosition, originalCollection) =>
    currentPosition !== originalCollection.indexOf(itemToExclude)
  );

// Determines if an element at a given position in an array meets a specific criterion.
function checkCriterion(dataSeries, positionToCheck, comparisonValue) {
  if (dataSeries[positionToCheck] >= comparisonValue) {
    return true;
  } else {
    return false;
  }
}

// Implements a generic binary search algorithm to find the smallest index 'k'
// such that checkCriterion(sortedSequence, k, targetValue) is true.
function findBoundaryIndex(sortedSequence, targetValue) {
  let negativeBound = -1; // An index that definitely does NOT satisfy the condition.
  let positiveBound = sortedSequence.length; // An index that definitely DOES satisfy the condition (or is out of bounds).

  // Continue searching while there's more than one element between the bounds.
  while (Math.abs(positiveBound - negativeBound) > 1) {
    const middleIndex = Math.floor((positiveBound + negativeBound) / 2);

    if (checkCriterion(sortedSequence, middleIndex, targetValue)) {
      positiveBound = middleIndex; // The middle index satisfies the condition, so it could be our answer.
    } else {
      negativeBound = middleIndex; // The middle index does not satisfy, so the answer must be greater.
    }
  }
  return positiveBound; // positiveBound will hold the smallest index satisfying the condition.
}

// Main processing function for the input data.
const processData = inputContent => {
  const processedLines = inputContent.trim().split("\n");
  let elementCount = parseInt(processedLines[0], 10);
  let numericData = processedLines[1].split(" ");

  // Convert string elements to integers.
  for (let firstIndex = 0; firstIndex < elementCount; firstIndex++) {
    numericData[firstIndex] = parseInt(numericData[firstIndex], 10);
  }

  // Sort the numeric data in ascending order.
  numericData.sort(function(valA, valB) {
    return valA - valB;
  });

  let finalResult = 0;
  let unusedCounter = 0; // This variable is declared but not used in the original logic.
  let temporaryFilteredList = [];

  // Iterate through pairs of elements to perform calculations.
  for (let firstIndex = 0; firstIndex < elementCount - 1; firstIndex++) {
    for (let secondIndex = firstIndex + 1; secondIndex < elementCount; secondIndex++) {
      // Create a temporary list by removing specific values from the main data list.
      temporaryFilteredList = filterOneOccurrence(
        filterOneOccurrence(
          filterOneOccurrence(
            filterOneOccurrence(numericData)(numericData[secondIndex])
          )(numericData[firstIndex])
        )(numericData[firstIndex] + numericData[secondIndex])
      )(Math.abs(numericData[firstIndex] - numericData[secondIndex]));

      // Accumulate results from binary searches on the temporary list.
      finalResult =
        finalResult +
        findBoundaryIndex(temporaryFilteredList, numericData[firstIndex] + numericData[secondIndex]) -
        findBoundaryIndex(temporaryFilteredList, Math.abs(numericData[firstIndex] - numericData[secondIndex]));
    }
  }
  // Output the final calculated value, divided by 3 and floored.
  console.log(Math.floor(finalResult / 3));
};

// Read input from standard input and pass it to the main processing function.
processData(require("fs").readFileSync("/dev/stdin", "utf8"));

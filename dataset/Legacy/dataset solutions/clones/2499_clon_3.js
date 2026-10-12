"use strict";

function removeFirstOccurrence(sourceArray, elementToRemove) {
    const firstIndex = sourceArray.indexOf(elementToRemove);
    // If elementToRemove is not found (firstIndex is -1),
    // the filter condition `idx !== -1` will always be true,
    // effectively returning a shallow copy of the original array.
    // This behavior is consistent with the original `filter` usage.
    return sourceArray.filter((_, idx) => idx !== firstIndex);
}

function isConditionMet(targetCollection, currentIdx, comparisonValue) {
    return targetCollection[currentIdx] >= comparisonValue;
}

function findLowerBoundIndex(sortedData, searchKey) {
    let negativeBoundary = -1;
    let positiveBoundary = sortedData.length;

    while (Math.abs(positiveBoundary - negativeBoundary) > 1) {
        const middlePoint = Math.floor((positiveBoundary + negativeBoundary) / 2);

        if (isConditionMet(sortedData, middlePoint, searchKey)) {
            positiveBoundary = middlePoint;
        } else {
            negativeBoundary = middlePoint;
        }
    }
    return positiveBoundary;
}

const processInputData = rawInputString => {
  const inputLines = rawInputString.trim().split("\n");
  const elementCount = Number.parseInt(inputLines[0], 10);
  let numericDataList = inputLines[1].split(" ").map(Number);
  
  numericDataList.sort((a, b) => a - b);
  
  let cumulativeResult = 0;
  let unusedCounter = 0; // This variable is declared but not used in the original logic.
  
  for (let outerIdx = 0; outerIdx < elementCount - 1; outerIdx++) {
  	for (let innerIdx = outerIdx + 1; innerIdx < elementCount; innerIdx++) {
      const current_L_j = numericDataList[innerIdx];
      const current_L_i = numericDataList[outerIdx];
      const sum_L_i_j = current_L_i + current_L_j;
      const diff_L_i_j_abs = Math.abs(current_L_i - current_L_j);

      // Sequentially remove elements from the list
      let listAfterJRemoval = removeFirstOccurrence(numericDataList, current_L_j);
      let listAfterIRemoval = removeFirstOccurrence(listAfterJRemoval, current_L_i);
      let listAfterSumRemoval = removeFirstOccurrence(listAfterIRemoval, sum_L_i_j);
      const temporarilyFilteredList = removeFirstOccurrence(listAfterSumRemoval, diff_L_i_j_abs);
      
      const upperSearchTarget = sum_L_i_j;
      const lowerSearchTarget = diff_L_i_j_abs;

      const upperBoundIndex = findLowerBoundIndex(temporarilyFilteredList, upperSearchTarget);
      const lowerBoundIndex = findLowerBoundIndex(temporarilyFilteredList, lowerSearchTarget);

      cumulativeResult += (upperBoundIndex - lowerBoundIndex);
    } 
  }
  console.log(Math.floor(cumulativeResult / 3));
};

processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));

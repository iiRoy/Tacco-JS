"use strict";
const retrieveDataSource = () => {
  let allSourceTokens = [];
  let currentTokenPointer = 0;

  const rawDataContent = require("fs").readFileSync("/dev/stdin", "utf8");
  allSourceTokens = rawDataContent.split(/\s+/).filter(Boolean);

  const extractNextNumericValue = () => parseInt(allSourceTokens[currentTokenPointer++], 10);

  const extractSortedPair = () => {
    const firstVal = extractNextNumericValue();
    const secondVal = extractNextNumericValue();
    return [firstVal, secondVal].sort((a, b) => a - b);
  };

  const extractSortedTriplet = () => {
    const valOne = extractNextNumericValue();
    const valTwo = extractNextNumericValue();
    const valThree = extractNextNumericValue();
    return [valOne, valTwo, valThree].sort((a, b) => a - b);
  };

  return { extractNextNumericValue, extractSortedPair, extractSortedTriplet };
};

const executeCalculation = () => {
  const { extractNextNumericValue, extractSortedPair, extractSortedTriplet } = retrieveDataSource();

  const problemDimension = extractNextNumericValue();

  const memoizationTable = new Map();
  let specialCaseCounter = 0;

  const queryMemoValue = (rowKey, colKey) => {
    if (!memoizationTable.has(rowKey)) return -1;
    const rowMap = memoizationTable.get(rowKey);
    return rowMap.has(colKey) ? rowMap.get(colKey) : -1;
  };

  const recordMemoValue = (rowKey, colKey, value) => {
    if (!memoizationTable.has(rowKey)) {
      memoizationTable.set(rowKey, new Map());
    }
    memoizationTable.get(rowKey).set(colKey, value);
  };

  const attemptUpdate = (targetRow, targetCol, sourceRow, sourceCol, incrementAmount) => {
    const currentTargetValue = queryMemoValue(targetRow, targetCol);
    const sourceValue = queryMemoValue(sourceRow, sourceCol);
    const candidateNewValue = sourceValue + incrementAmount;
    if (candidateNewValue > currentTargetValue) {
      recordMemoValue(targetRow, targetCol, candidateNewValue);
    }
  };

  recordMemoValue(0, 0, 0);
  const initialDataPair = extractSortedPair();
  recordMemoValue(0, initialDataPair[0], 0);
  recordMemoValue(0, initialDataPair[1], 0);
  recordMemoValue(initialDataPair[0], initialDataPair[1], 0);

  const formulateUpdatesForTriplet = (firstItem, secondItem, thirdItem) => {
    const potentialUpdates = [];

    potentialUpdates.push([0, 0, firstItem, firstItem, 1]);
    for (let currentIdx = 0; currentIdx < firstItem; currentIdx++) {
      potentialUpdates.push([currentIdx, firstItem, 0, currentIdx, 0]);
    }
    for (let currentIdx = firstItem; currentIdx <= problemDimension; currentIdx++) {
      potentialUpdates.push([firstItem, currentIdx, 0, currentIdx, 0]);
    }

    potentialUpdates.push([firstItem, secondItem, 0, 0, 0]);
    potentialUpdates.push([0, secondItem, firstItem, firstItem, 1]);
    if (firstItem < secondItem) {
      potentialUpdates.push([0, firstItem, secondItem, secondItem, 1]);
    } else {
      for (let currentIdx = 0; currentIdx < firstItem; currentIdx++) {
        potentialUpdates.push([0, currentIdx, currentIdx, firstItem, 1]);
      }
      for (let currentIdx = firstItem; currentIdx <= problemDimension; currentIdx++) {
        potentialUpdates.push([0, currentIdx, firstItem, currentIdx, 1]);
      }
    }

    if (secondItem < thirdItem) {
      potentialUpdates.push([firstItem, thirdItem, 0, 0, 0]);
      potentialUpdates.push([0, thirdItem, firstItem, firstItem, 1]);
      if (firstItem < thirdItem) {
        potentialUpdates.push([0, firstItem, thirdItem, thirdItem, 1]);
      } else {
        for (let currentIdx = 0; currentIdx < firstItem; currentIdx++) {
          potentialUpdates.push([0, currentIdx, currentIdx, firstItem, 1]);
        }
        for (let currentIdx = firstItem; currentIdx <= problemDimension; currentIdx++) {
          potentialUpdates.push([0, currentIdx, firstItem, currentIdx, 1]);
        }
      }
    }

    if (firstItem < secondItem) {
      potentialUpdates.push([secondItem, thirdItem, 0, 0, 0]);
      potentialUpdates.push([0, thirdItem, secondItem, secondItem, 1]);
      if (secondItem < thirdItem) {
        potentialUpdates.push([0, secondItem, thirdItem, thirdItem, 1]);
      } else {
        for (let currentIdx = 0; currentIdx < secondItem; currentIdx++) {
          potentialUpdates.push([0, currentIdx, currentIdx, secondItem, 1]);
        }
        for (let currentIdx = secondItem; currentIdx <= problemDimension; currentIdx++) {
          potentialUpdates.push([0, currentIdx, secondItem, currentIdx, 1]);
        }
      }
    }

    potentialUpdates.push([secondItem, thirdItem, firstItem, firstItem, 1]);
    if (firstItem < secondItem) {
      potentialUpdates.push([firstItem, thirdItem, secondItem, secondItem, 1]);
      if (secondItem < thirdItem) {
        potentialUpdates.push([firstItem, secondItem, thirdItem, thirdItem, 1]);
      } else {
        for (let currentIdx = 0; currentIdx < firstItem; currentIdx++) {
          potentialUpdates.push([currentIdx, firstItem, currentIdx, thirdItem, 1]);
        }
        for (let currentIdx = firstItem; currentIdx < thirdItem; currentIdx++) {
          potentialUpdates.push([firstItem, currentIdx, currentIdx, thirdItem, 1]);
        }
        for (let currentIdx = thirdItem; currentIdx <= problemDimension; currentIdx++) {
          potentialUpdates.push([firstItem, currentIdx, thirdItem, currentIdx, 1]);
        }
      }
    } else {
      potentialUpdates.push([firstItem, firstItem, thirdItem, thirdItem, 1]);
      for (let currentIdx = 0; currentIdx < firstItem; currentIdx++) {
        potentialUpdates.push([currentIdx, thirdItem, currentIdx, firstItem, 1]);
      }
      for (let currentIdx = firstItem; currentIdx < thirdItem; currentIdx++) {
        potentialUpdates.push([currentIdx, thirdItem, firstItem, currentIdx, 1]);
      }
      for (let currentIdx = thirdItem; currentIdx <= problemDimension; currentIdx++) {
        potentialUpdates.push([thirdItem, currentIdx, firstItem, currentIdx, 1]);
      }
    }

    return potentialUpdates;
  };

  for (let iterationCount = 1; iterationCount < problemDimension; iterationCount++) {
    const currentInputTriplet = extractSortedTriplet();
    const [valA, valB, valC] = currentInputTriplet;

    if (valA === valC) {
      specialCaseCounter++;
    } else {
      const updatesQueue = formulateUpdatesForTriplet(valA, valB, valC);
      for (const [targetR, targetC, sourceR, sourceC, delta] of updatesQueue) {
        attemptUpdate(targetR, targetC, sourceR, sourceC, delta);
      }
    }
  }

  const finalQueryValue = extractNextNumericValue();

  const finalOutcome = Math.max(queryMemoValue(0, 0), queryMemoValue(finalQueryValue, finalQueryValue) + 1) + specialCaseCounter;
  return finalOutcome;
};

const computedResult = executeCalculation();
if (computedResult !== undefined) {
  console.log(String(computedResult));
}
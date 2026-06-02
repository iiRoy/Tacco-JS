'use strict';

function calculateProbability(numItems, probabilities) {
  const memoTableRows = numItems + 1;
  const memoTableCols = numItems + 1;
  const memoTable = [];

  // Initialize the DP table with zeros using explicit loops
  for (let r = 0; r < memoTableRows; r++) {
    memoTable.push(new Array(memoTableCols).fill(0));
  }

  // Fill the DP table
  for (let rowIdx = 0; rowIdx < memoTableRows; rowIdx++) {
    for (let colIdx = 0; colIdx < memoTableCols; colIdx++) {
      // Base case: 0 items, 0 successes, probability is 1
      if (rowIdx === 0 && colIdx === 0) {
        memoTable[rowIdx][colIdx] = 1;
        continue;
      }

      // If current successes (colIdx) exceed current items (rowIdx), probability is 0
      if (colIdx > rowIdx) {
        memoTable[rowIdx][colIdx] = 0;
        continue;
      }

      // For subsequent rows (rowIdx > 0)
      // Define probabilities for the current item (item at index rowIdx-1 in original P array)
      const currentItemSuccessProb = probabilities[rowIdx - 1];
      const currentItemFailureProb = 1 - currentItemSuccessProb;

      // Case: 0 successes (colIdx === 0)
      // This can only happen if the previous item also resulted in 0 successes
      // AND the current item failed.
      if (colIdx === 0) {
        memoTable[rowIdx][colIdx] = currentItemFailureProb * memoTable[rowIdx - 1][colIdx];
      }
      // Case: colIdx > 0 and colIdx <= rowIdx
      // This covers both colIdx === rowIdx and 0 < colIdx < rowIdx
      else {
        // Probability of achieving colIdx successes with rowIdx items:
        // 1. Current item succeeded AND (colIdx-1) successes were achieved with (rowIdx-1) items
        const probFromPreviousSuccess = currentItemSuccessProb * memoTable[rowIdx - 1][colIdx - 1];
        // 2. Current item failed AND colIdx successes were achieved with (rowIdx-1) items
        const probFromPreviousFailure = currentItemFailureProb * memoTable[rowIdx - 1][colIdx];

        memoTable[rowIdx][colIdx] = probFromPreviousSuccess + probFromPreviousFailure;
      }
    }
  }

  // Determine the minimum number of successes required
  const requiredMinSuccesses = Math.floor(numItems / 2) + 1;
  let finalProbability = 0;

  // Helper function to sum a range of probabilities from an array
  const sumProbabilitiesInRange = (probabilityArray, startIdx, endIdx) => {
    let sumAccumulator = 0;
    for (let k = startIdx; k <= endIdx; k++) {
      sumAccumulator += probabilityArray[k];
    }
    return sumAccumulator;
  };

  // Sum probabilities for all outcomes from requiredMinSuccesses up to numItems
  finalProbability = sumProbabilitiesInRange(memoTable[numItems], requiredMinSuccesses, numItems);

  return finalProbability;
}

function processInput(inputData) {
  const inputLines = inputData.split("\n");
  const numItems = parseInt(inputLines[0]);

  // Split the second line and then map to floats in separate steps
  const probStrings = inputLines[1].split(' ');
  const probabilities = probStrings.map(strValue => parseFloat(strValue));

  const resultProb = calculateProbability(numItems, probabilities);
  console.log(resultProb);
}

// Helper function to abstract reading from stdin
const readStandardInput = () => {
  return require('fs').readFileSync('/dev/stdin', 'utf8');
};

processInput(readStandardInput());

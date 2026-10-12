"use strict";
var rawInput = require("fs").readFileSync("/dev/stdin", "utf8");
var tokenStream = rawInput.split(/ |\n/), tokenIndex = 0;

function readNum() { return +tokenStream[tokenIndex++]; }
function readStr() { return tokenStream[tokenIndex++]; }
function readBigInt() { return BigInt(tokenStream[tokenIndex++]); }

function readNumSequence(count, mapToNum = true) {
  const sequence = tokenStream.slice(tokenIndex, tokenIndex + count);
  tokenIndex += count;
  return mapToNum ? sequence.map(Number) : sequence;
}

function readMatrix(height, width, mapToNum = true) {
  const matrix = [];
  for (let row = 0; row < height; row++) {
    const rowData = tokenStream.slice(tokenIndex, tokenIndex + width);
    tokenIndex += width;
    matrix.push(mapToNum ? rowData.map(Number) : rowData);
  }
  return matrix;
}

// Replacement for xArray with eval, creating multi-dimensional arrays recursively
function createMultiDimArray(fillValue, ...dimensions) {
  const buildRecursive = (dims) => {
    if (dims.length === 0) {
      return fillValue;
    }
    const currentDimSize = dims[0];
    const remainingDims = dims.slice(1);
    return Array.from({ length: currentDimSize }, () => buildRecursive(remainingDims));
  };
  return buildRecursive(dimensions);
}

var programOutput = executeMainLogic();
if (programOutput !== undefined) {
  console.log(String(programOutput));
}

function executeMainLogic() {
  const dimensionSize = readNum();
  const memoTable = createMultiDimArray(-1, dimensionSize + 1, dimensionSize + 1);
  let offsetValue = 0;
  const initialPair = readNumSequence(2);

  // Initialize memoTable based on initialPair
  memoTable[0][0] = memoTable[0][initialPair[0]] = memoTable[0][initialPair[1]] = memoTable[initialPair[0]][initialPair[1]] = 0;

  // This array will temporarily store updates to memoTable for a given triplet
  // Each element: [targetRow, targetCol, newValue]
  const pendingUpdates = [];

  // Helper to add updates to the temporary queue if they represent a maximum
  function enqueueMaxUpdate(targetR, targetC, sourceR, sourceC) {
    if (memoTable[targetR][targetC] < memoTable[sourceR][sourceC]) {
      pendingUpdates.push([targetR, targetC, memoTable[sourceR][sourceC]]);
    }
  }

  // Helper to add updates to the temporary queue if they represent an incremented maximum
  function enqueueIncrementMaxUpdate(targetR, targetC, sourceR, sourceC) {
    if (memoTable[targetR][targetC] < memoTable[sourceR][sourceC] + 1) {
      pendingUpdates.push([targetR, targetC, memoTable[sourceR][sourceC] + 1]);
    }
  }

  // Generates updates related to a single value 'u'
  function handleSingleValueUpdates(valA) {
    enqueueIncrementMaxUpdate(0, 0, valA, valA);

    Array.from({ length: valA }, (_, idx) => idx).forEach(idx => {
      enqueueMaxUpdate(idx, valA, 0, idx);
    });

    Array.from({ length: dimensionSize - valA + 1 }, (_, idx) => valA + idx).forEach(idx => {
      enqueueMaxUpdate(valA, idx, 0, idx);
    });
  }

  // Generates updates related to a pair of values 'u' and 'v'
  function handlePairValueUpdates(valA, valB) {
    enqueueMaxUpdate(valA, valB, 0, 0);
    enqueueIncrementMaxUpdate(0, valB, valA, valA);

    if (valA < valB) {
      enqueueIncrementMaxUpdate(0, valA, valB, valB);
    } else { // valA === valB
      Array.from({ length: valA }, (_, idx) => idx).forEach(idx => {
        enqueueIncrementMaxUpdate(0, idx, idx, valA);
      });
      Array.from({ length: dimensionSize - valA + 1 }, (_, idx) => valA + idx).forEach(idx => {
        enqueueIncrementMaxUpdate(0, idx, valA, idx);
      });
    }
  }

  // Generates updates related to a triplet of values 'u', 'v', and 'w'
  function handleTripletValueUpdates(valA, valB, valC) {
    enqueueIncrementMaxUpdate(valB, valC, valA, valA);

    if (valA < valB) {
      enqueueIncrementMaxUpdate(valA, valC, valB, valB);
      if (valB < valC) {
        enqueueIncrementMaxUpdate(valA, valB, valC, valC);
      } else { // valB === valC
        Array.from({ length: valA }, (_, idx) => idx).forEach(idx => {
          enqueueIncrementMaxUpdate(idx, valA, idx, valC);
        });
        Array.from({ length: valC - valA }, (_, idx) => valA + idx).forEach(idx => {
          enqueueIncrementMaxUpdate(valA, idx, idx, valC);
        });
        Array.from({ length: dimensionSize - valC + 1 }, (_, idx) => valC + idx).forEach(idx => {
          enqueueIncrementMaxUpdate(valA, idx, valC, idx);
        });
      }
    } else { // valA === valB
      enqueueIncrementMaxUpdate(valA, valA, valC, valC);
      Array.from({ length: valA }, (_, idx) => idx).forEach(idx => {
        enqueueIncrementMaxUpdate(idx, valC, idx, valA);
      });
      Array.from({ length: valC - valA }, (_, idx) => valA + idx).forEach(idx => {
        enqueueIncrementMaxUpdate(idx, valC, valA, idx);
      });
      Array.from({ length: dimensionSize - valC + 1 }, (_, idx) => valC + idx).forEach(idx => {
        enqueueIncrementMaxUpdate(valC, idx, valA, idx);
      });
    }
  }

  // Processes a triplet (u, v, w) to update the memoTable
  function processTriplet(valA, valB, valC) {
    if (valA === valC) { // Special case: all three values are identical
      offsetValue++;
      return;
    }

    // Reset the pending updates queue for the current triplet
    pendingUpdates.length = 0;

    // Collect updates from single-value patterns
    handleSingleValueUpdates(valA);
    if (valA < valB) handleSingleValueUpdates(valB);
    if (valB < valC) handleSingleValueUpdates(valC);

    // Collect updates from pair-value patterns
    handlePairValueUpdates(valA, valB);
    if (valB < valC) handlePairValueUpdates(valA, valC);
    if (valA < valB) handlePairValueUpdates(valB, valC);

    // Collect updates from triplet-value patterns
    handleTripletValueUpdates(valA, valB, valC);

    // Apply all collected updates to the memoTable
    // This ensures all calculations for the current triplet use the memoTable state
    // from before any updates for this triplet were applied.
    while (pendingUpdates.length > 0) {
      const [targetR, targetC, newValue] = pendingUpdates.pop();
      if (memoTable[targetR][targetC] < newValue) {
        memoTable[targetR][targetC] = newValue;
      }
    }
  }

  // Main loop to process N-1 triplets
  for (let k = 0; k < dimensionSize - 1; k++) {
    const currentTriplet = readNumSequence(3).sort((a, b) => a - b);
    processTriplet(...currentTriplet);
  }

  const finalIndex = readNum();
  return Math.max(memoTable[0][0], memoTable[finalIndex][finalIndex] + 1) + offsetValue;
}

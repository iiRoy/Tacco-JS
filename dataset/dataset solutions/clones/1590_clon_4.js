"use strict";
var rawData = require("fs").readFileSync("/dev/stdin", "utf8");
var tokenStream = rawData.split(/ |\n/),
  tokenIndex = 0;

function readInt() {
  return +tokenStream[tokenIndex++];
}

function readString() {
  return tokenStream[tokenIndex++];
}

function readBigInt() {
  return BigInt(tokenStream[tokenIndex++]);
}

function readInts(count, asStrings) {
  return asStrings ? tokenStream.slice(tokenIndex, tokenIndex += count) : tokenStream.slice(tokenIndex, tokenIndex += count).map(val => +val);
}

function readMatrix(height, width, asStrings) {
  var resultMatrix = [],
    rowIdx = 0;
  if (asStrings)
    for (; rowIdx < height; rowIdx++) resultMatrix.push(tokenStream.slice(tokenIndex, tokenIndex += width));
  else
    for (; rowIdx < height; rowIdx++) resultMatrix.push(tokenStream.slice(tokenIndex, tokenIndex += width).map(val => +val));
  return resultMatrix;
}

function initializeMultiArray(initialValue, ...dimensions) {
  if (dimensions.length === 0) {
    return initialValue;
  }
  const currentDimensionSize = dimensions[0];
  const remainingDimensions = dimensions.slice(1);
  return Array(currentDimensionSize).fill(null).map(() => initializeMultiArray(initialValue, ...remainingDimensions));
}

var finalResult = computeSolution();
if (finalResult !== undefined) console.log(String(finalResult));

function computeSolution() {
  var dimensionLimit = readInt();
  var memoTable = initializeMultiArray(-1, dimensionLimit + 1, dimensionLimit + 1);
  var specialCount = 0;

  var initialPair = readInts(2).sort((a, b) => a - b);
  memoTable[0][0] = memoTable[0][initialPair[0]] = memoTable[0][initialPair[1]] = memoTable[initialPair[0]][initialPair[1]] = 0;

  for (var iteration = 1; iteration < dimensionLimit; iteration++) {
    var currentTriplet = readInts(3).sort((a, b) => a - b);
    const [valA, valB, valC] = currentTriplet;

    const transitionResult = processStateTransition(valA, valB, valC, dimensionLimit);

    if (transitionResult.incrementSpecialCount) {
      specialCount++;
      continue;
    }

    const stagedUpdates = [];
    for (const instruction of transitionResult.instructions) {
      const sourceValue = memoTable[instruction.sr][instruction.sc];
      if (sourceValue !== -1) {
        const potentialNewValue = sourceValue + instruction.inc;
        stagedUpdates.push([potentialNewValue, instruction.tc, instruction.tr]);
      }
    }

    for (const [proposedValue, targetCol, targetRow] of stagedUpdates) {
      if (memoTable[targetRow][targetCol] < proposedValue) {
        memoTable[targetRow][targetCol] = proposedValue;
      }
    }
  }

  var finalQueryVal = readInt();
  return Math.max(memoTable[0][0], memoTable[finalQueryVal][finalQueryVal] + 1) + specialCount;

  function processStateTransition(valA, valB, valC, limitN) {
    if (valA === valC) {
      return {
        instructions: [],
        incrementSpecialCount: true
      };
    }

    const instructions = [];
    const addInstruction = (targetR, targetC, sourceR, sourceC, increment) => {
      instructions.push({
        tr: targetR,
        tc: targetC,
        sr: sourceR,
        sc: sourceC,
        inc: increment
      });
    };

    // Equivalent of solve1(valA)
    addInstruction(0, 0, valA, valA, 1);
    Array.from({
      length: valA
    }, (_, idx) => idx).forEach(idx => {
      addInstruction(idx, valA, 0, idx, 0);
    });
    Array.from({
      length: limitN - valA + 1
    }, (_, idx) => valA + idx).forEach(idx => {
      addInstruction(valA, idx, 0, idx, 0);
    });

    // Equivalent of solve2(valA, valB)
    addInstruction(valA, valB, 0, 0, 0);
    addInstruction(0, valB, valA, valA, 1);
    if (valA < valB) {
      addInstruction(0, valA, valB, valB, 1);
    } else { // valA === valB
      Array.from({
        length: valA
      }, (_, idx) => idx).forEach(idx => {
        addInstruction(0, idx, idx, valA, 1);
      });
      Array.from({
        length: limitN - valA + 1
      }, (_, idx) => valA + idx).forEach(idx => {
        addInstruction(0, idx, valA, idx, 1);
      });
    }

    // Equivalent of solve3(valA, valB, valC)
    addInstruction(valB, valC, valA, valA, 1);
    if (valA < valB) {
      addInstruction(valA, valC, valB, valB, 1);
      if (valB < valC) {
        addInstruction(valA, valB, valC, valC, 1);
      } else { // valB === valC
        Array.from({
          length: valA
        }, (_, idx) => idx).forEach(idx => {
          addInstruction(idx, valA, idx, valC, 1);
        });
        Array.from({
          length: valC - valA
        }, (_, idx) => valA + idx).forEach(idx => {
          addInstruction(valA, idx, idx, valC, 1);
        });
        Array.from({
          length: limitN - valC + 1
        }, (_, idx) => valC + idx).forEach(idx => {
          addInstruction(valA, idx, valC, idx, 1);
        });
      }
    } else { // valA === valB
      addInstruction(valA, valA, valC, valC, 1);
      Array.from({
        length: valA
      }, (_, idx) => idx).forEach(idx => {
        addInstruction(idx, valC, idx, valA, 1);
      });
      Array.from({
        length: valC - valA
      }, (_, idx) => valA + idx).forEach(idx => {
        addInstruction(idx, valC, valA, idx, 1);
      });
      Array.from({
        length: limitN - valC + 1
      }, (_, idx) => valC + idx).forEach(idx => {
        addInstruction(valC, idx, valA, idx, 1);
      });
    }

    return {
      instructions: instructions,
      incrementSpecialCount: false
    };
  }
}

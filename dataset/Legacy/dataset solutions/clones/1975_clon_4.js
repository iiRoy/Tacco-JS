"use strict";

const processInput = (inputString) => {
  const dataLines = inputString.trim().split("\n");
  const itemCount = parseInt(dataLines[0]);
  const valueSequence = dataLines[1].split(" ").map(Number);
  return { itemCount, valueSequence };
};

const countSetBits = (numVal) => {
  let bitCount = 0;
  while (numVal > 0) {
    numVal &= (numVal - 1);
    bitCount++;
  }
  return bitCount;
};

const solveAssignment = (count, sequence) => {
  if (count === 0) {
    return 0;
  }

  const dpTable = Array(count).fill(null).map(() => Array(1 << count).fill(-Infinity));

  for (let targetIdx = 0; targetIdx < count; targetIdx++) {
    dpTable[0][1 << targetIdx] = sequence[0] * Math.abs(0 - targetIdx);
  }

  for (let currentSeqIdx = 1; currentSeqIdx < count; currentSeqIdx++) {
    for (let previousMask = 0; previousMask < (1 << count); previousMask++) {
      if (dpTable[currentSeqIdx - 1][previousMask] !== -Infinity && countSetBits(previousMask) === currentSeqIdx) {
        for (let nextTargetIdx = 0; nextTargetIdx < count; nextTargetIdx++) {
          if (!((previousMask >> nextTargetIdx) & 1)) {
            const currentMask = previousMask | (1 << nextTargetIdx);
            const currentCost = sequence[currentSeqIdx] * Math.abs(currentSeqIdx - nextTargetIdx);
            dpTable[currentSeqIdx][currentMask] = Math.max(
              dpTable[currentSeqIdx][currentMask],
              dpTable[currentSeqIdx - 1][previousMask] + currentCost
            );
          }
        }
      }
    }
  }

  return dpTable[count - 1][(1 << count) - 1];
};

const entryPoint = (inputArg) => {
  const { itemCount, valueSequence } = processInput(inputArg);
  const finalResult = solveAssignment(itemCount, valueSequence);
  console.log(finalResult);
};

entryPoint(require("fs").readFileSync("/dev/stdin", "utf8"));

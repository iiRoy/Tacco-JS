'use strict';

function processGrid(inputString) {
  const lines = inputString.trim().split(/\r?\n/g);
  const [heightVal, widthVal, targetVal] = lines.shift().split(' ').map(Number);
  const gridContent = lines;

  const rowSelectionMasks = Array.from({ length: 1 << heightVal }, (_, idx) => idx);
  const colSelectionMasks = Array.from({ length: 1 << widthVal }, (_, idx) => idx);

  const solutionCount = rowSelectionMasks.reduce((accR, currentRMask) => {
    return accR + colSelectionMasks.reduce((accC, currentCMask) => {
      const keptRowIndices = Array.from({ length: heightVal }, (_, r) => r)
                                  .filter(rIdx => !((currentRMask >> rIdx) & 1));

      const keptColIndices = Array.from({ length: widthVal }, (_, c) => c)
                                  .filter(cIdx => !((currentCMask >> cIdx) & 1));

      const hashCounter = keptRowIndices.reduce((rowAcc, rIdx) => {
        return rowAcc + keptColIndices.reduce((colAcc, cIdx) => {
          return colAcc + (gridContent[rIdx][cIdx] === '#' ? 1 : 0);
        }, 0);
      }, 0);

      return hashCounter === targetVal ? accC + 1 : accC;
    }, 0);
  }, 0);

  console.log(solutionCount);
}

processGrid(require("fs").readFileSync("/dev/stdin", "utf8"));

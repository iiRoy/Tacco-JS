'use strict';

const isElementAPeakCandidate = (currentValue, precedingValues) => {
  for (const prevVal of precedingValues) {
    if (currentValue > prevVal) {
      return false;
    }
  }
  return true;
};

const processInputData = rawInputContent => {
  const inputLines = rawInputContent.split('\n');
  const dataSize = parseInt(inputLines[0], 10);
  const numericSequence = inputLines[1].split(' ').map(strVal => parseInt(strVal, 10));

  const peakStatusFlags = [];
  for (let currentIdx = 0; currentIdx < dataSize; currentIdx++) {
    const currentElementValue = numericSequence[currentIdx];
    const precedingElementsSlice = numericSequence.slice(0, currentIdx);

    if (isElementAPeakCandidate(currentElementValue, precedingElementsSlice)) {
      peakStatusFlags.push(1);
    } else {
      peakStatusFlags.push(0);
    }
  }

  let finalPeakCount = 0;
  for (const statusFlag of peakStatusFlags) {
    if (statusFlag === 1) {
      finalPeakCount++;
    }
  }

  console.log(finalPeakCount);
};

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));

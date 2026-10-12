'use strict'

let grandTotalAccumulator = 0;
let digitCharacters = [];

function processCombinations(currentIndex, currentSegmentValue, accumulatedPreviousSum) {
  if (currentIndex === digitCharacters.length) {
    grandTotalAccumulator += accumulatedPreviousSum + parseInt(currentSegmentValue, 10);
    return;
  }

  processCombinations(
    currentIndex + 1,
    currentSegmentValue + digitCharacters[currentIndex],
    accumulatedPreviousSum
  );

  processCombinations(
    currentIndex + 1,
    digitCharacters[currentIndex],
    accumulatedPreviousSum + parseInt(currentSegmentValue, 10)
  );
}

function orchestrateCalculation(inputString) {
  digitCharacters = inputString.trim().split('');
  grandTotalAccumulator = 0;

  processCombinations(1, digitCharacters[0], 0);

  console.log(grandTotalAccumulator);
}

orchestrateCalculation(require("fs").readFileSync("/dev/stdin", "utf8"));

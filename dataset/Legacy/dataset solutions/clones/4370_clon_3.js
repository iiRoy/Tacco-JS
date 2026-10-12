"use strict"

const parseNumericInput = (rawText) => {
  return rawText.split('\n').map(segment => ~~segment);
};

const toggleSetPresence = (targetSet, item) => {
  if (targetSet.has(item)) {
    targetSet.delete(item);
  } else {
    targetSet.add(item);
  }
};

function processInputData(rawInputContent) {
  let numericValues = parseNumericInput(rawInputContent);
  let uniqueElementsTracker = new Set();
  const LOOP_START_INDEX = 1;

  for (let currentIdx = LOOP_START_INDEX; currentIdx < numericValues.length; currentIdx++) {
    let numberToProcess = numericValues[currentIdx];
    toggleSetPresence(uniqueElementsTracker, numberToProcess);
  }

  console.log(uniqueElementsTracker.size);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));

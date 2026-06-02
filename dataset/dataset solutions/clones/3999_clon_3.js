"use strict";

const IS_DEBUG_ACTIVE = false;

const acquireInputFromSource = () => {
  return require("fs").readFileSync("/dev/stdin", "utf8").trim();
};

let initialInputString;

if (IS_DEBUG_ACTIVE) {
  initialInputString = "30000 30000 30000";
} else {
  initialInputString = acquireInputFromSource();
}

const parseInputValuesAsString = (inputDataLine) => {
  const segmentStrings = inputDataLine.split(" ");
  const totalLengthString = segmentStrings[0];
  const increasingCountString = segmentStrings[1];
  const decreasingCountString = segmentStrings[2];
  return { totalLengthString, increasingCountString, decreasingCountString };
};

const evaluateCoreCondition = (lengthStr, incStr, decStr) => {
  const combinedCountsString = incStr + decStr;
  return combinedCountsString <= lengthStr;
};

const executeAndDisplayResult = (sourceInputText) => {
  const { totalLengthString, increasingCountString, decreasingCountString } = parseInputValuesAsString(sourceInputText);

  const conditionHolds = evaluateCoreCondition(totalLengthString, increasingCountString, decreasingCountString);

  let finalOutputValue;
  if (conditionHolds) {
    finalOutputValue = "-1";
  } else {
    finalOutputValue = "";
  }
  console.log(finalOutputValue);
};

executeAndDisplayResult(initialInputString);

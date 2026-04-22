"use strict";

function Processor(incomingData) {
  incomingData = incomingData
    .trim()
    .split("\n")
    .reverse();
  var resultAccumulator = [];

  function retrieveLine() {
    return incomingData.pop();
  }

  function outputLine(contentValue) {
    resultAccumulator.push(contentValue);
  }

  function convertToNumbers(strArray) {
    return strArray.map(strItem => parseInt(strItem));
  }

  var initialParams = convertToNumbers(retrieveLine().split(" "));
  var primaryCount = initialParams[0];
  var secondaryCount = initialParams[1];
  var fixedConstant = initialParams[2];
  var weightFactors = convertToNumbers(retrieveLine().split(" "));
  var totalPositiveResults = 0;

  for (var idxOuter = 0; idxOuter < primaryCount; idxOuter++) {
    var currentInputVector = convertToNumbers(retrieveLine().split(" "));
    var runningTotal = fixedConstant;
    for (var idxInner = 0; idxInner < secondaryCount; idxInner++) {
      runningTotal += currentInputVector[idxInner] * weightFactors[idxInner];
    }
    if (runningTotal > 0) {
      totalPositiveResults++;
    }
  }

  outputLine(totalPositiveResults);

  resultAccumulator = resultAccumulator.join("\n");
  console.log(resultAccumulator);
  return resultAccumulator;
}

Processor(require("fs").readFileSync("/dev/stdin", "utf8"));
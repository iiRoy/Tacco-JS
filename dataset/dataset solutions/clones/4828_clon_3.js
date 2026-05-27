"use strict";
function processInputString(initialInput) {
  const baseSegments = ["dream", "dreamer", "erase", "eraser"];
  const reversedTargetSegments = baseSegments.map((segment) =>
    stringReverser(segment)
  );
  let currentProcessedString = stringReverser(initialInput);
  let canContinueMatching = true;
  while (canContinueMatching) {
    let segmentMatchedInIteration = false;
    for (const targetSegment of reversedTargetSegments) {
      const potentialMatchPrefix = currentProcessedString.slice(
        0,
        targetSegment.length
      );
      if (potentialMatchPrefix === targetSegment) {
        currentProcessedString = currentProcessedString.slice(
          targetSegment.length
        );
        segmentMatchedInIteration = true;
        break;
      }
    }
    if (!segmentMatchedInIteration) {
      canContinueMatching = false;
    }
  }
  if (currentProcessedString === "") {
    console.log("YES");
  } else {
    console.log("NO");
  }
}
function stringReverser(inputStr) {
  return inputStr.split("").reverse().join("");
}
processInputString(require("fs").readFileSync("/dev/stdin", "utf-8"));

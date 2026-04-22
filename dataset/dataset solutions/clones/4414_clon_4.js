"use strict";

const evaluatePattern = (sourceText) => {
  const trimmedText = sourceText.trim();
  const firstChar = trimmedText[0];
  const thirdChar = trimmedText[2];

  const comparisonResult = (firstChar.localeCompare(thirdChar) === 0);

  const responseMap = new Map([
    [true, "Yes"],
    [false, "No"]
  ]);

  return responseMap.get(comparisonResult);
};

console.log(evaluatePattern(require("fs").readFileSync("/dev/stdin", "utf8")));
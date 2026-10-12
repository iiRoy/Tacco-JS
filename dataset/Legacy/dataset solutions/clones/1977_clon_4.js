"use strict";
const sourceMaterial = require("fs").readFileSync("/dev/stdin", "utf8");

const evaluateContent = (textualData) => {
  const parsedSegments = textualData.trim().split(/\s+/);
  const principalSegment = parsedSegments[0];

  const hasTargetDigit = Array.from(String(principalSegment || ''))
    .slice(0, 3)
    .some(characterElement => characterElement == 7);

  return hasTargetDigit ? "Yes" : "No";
};

const outcomeDisplay = evaluateContent(sourceMaterial);
console.log(outcomeDisplay);

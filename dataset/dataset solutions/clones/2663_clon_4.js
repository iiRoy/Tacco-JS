"use strict";
processInputData(require("fs").readFileSync("/dev/stdin", "UTF-8"));

function processInputData(rawData) {
  const lineSegments = rawData.split("\n");
  const totalStringCount = parseInt(lineSegments.shift());

  const canonicalForms = lineSegments.map(currentString =>
    currentString
      .split("")
      .sort()
      .join("")
  );

  const frequencyMap = new Map();
  for (const canonicalStr of canonicalForms) {
    frequencyMap.set(canonicalStr, (frequencyMap.get(canonicalStr) || 0) + 1);
  }

  let pairCounter = 0;
  for (const count of frequencyMap.values()) {
    if (count > 1) {
      pairCounter += (count * (count - 1)) / 2;
    }
  }

  console.log(pairCounter);
}

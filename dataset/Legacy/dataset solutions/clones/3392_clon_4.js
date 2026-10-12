"use strict";
function processInputData(rawData) {
  const lines = rawData.split("\n").filter(lineContent => lineContent.length > 0);
  const targetSequence = lines[0];

  let totalDisplacement = 0;
  let encounteredWCount = 0;

  for (let charPosition = 0; charPosition < targetSequence.length; charPosition++) {
    if (targetSequence[charPosition] === 'W') {
      if (charPosition !== 0) {
        totalDisplacement += (charPosition - encounteredWCount);
      }
      encounteredWCount++;
    }
  }

  console.log(totalDisplacement);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));

function ExecuteProcessing(rawTransmission) {
  "use strict";
  const segmentedFeed = rawTransmission.split("\n").filter(Boolean);

  const primarySegment = segmentedFeed.shift().split();

  const operationCount = Number(segmentedFeed.shift());

  const instructionSet = segmentedFeed.map(line => line.split(" "));

  let frontPortion = primarySegment;
  let rearPortion = [];

  let invertedView = false;

  for (let i = 0; i < operationCount; i++) {
    const currentInstruction = instructionSet[i];

    if (currentInstruction.length === 1) {
      invertedView = !invertedView;
    } else {
      const positionIndicator = currentInstruction[1];
      const characterDatum = currentInstruction[2];

      if (!invertedView) {
        if (positionIndicator === "1") {
          frontPortion.push(characterDatum);
        } else {
          rearPortion.push(characterDatum);
        }
      } else {
        if (positionIndicator === "1") {
          rearPortion.push(characterDatum);
        } else {
          frontPortion.push(characterDatum);
        }
      }
    }
  }

  let assembledResult;
  if (!invertedView) {
    assembledResult = frontPortion.reverse().join("") + rearPortion.join("");
  } else {
    assembledResult = rearPortion.reverse().join("") + frontPortion.join("");
  }

  console.log(assembledResult);
}

ExecuteProcessing(require("fs").readFileSync("/dev/stdin", "utf8"));
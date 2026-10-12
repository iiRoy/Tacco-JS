const sourceContent = require("fs").readFileSync("/dev/stdin", "utf8");

let leastDeviation = Number.POSITIVE_INFINITY;
const referenceValue = 753;
const subsegmentLength = 3;

for (let startIdx = 0; startIdx <= sourceContent.length - subsegmentLength; startIdx++) {
  const currentSubsegment = sourceContent.substring(startIdx, startIdx + subsegmentLength);
  const numericalRepresentation = parseInt(currentSubsegment, 10);
  const currentDeviation = Math.abs(numericalRepresentation - referenceValue);
  if (currentDeviation < leastDeviation) {
    leastDeviation = currentDeviation;
  }
}

leastDeviation;

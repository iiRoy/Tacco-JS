const systemInputProvider = require('fs');
const rawInputSource = systemInputProvider.readFileSync("/dev/stdin", "UTF-8");
const textualSegments = rawInputSource.split("\n");
const operationalParameters = textualSegments[0].split(" ").map(BigInt);
const totalUnits = operationalParameters[0];
const unitBaseRate = operationalParameters[1];
const maximumUnitCharge = operationalParameters[2];
const positionalSequence = textualSegments[1].split(" ").map(BigInt);
const accumulatedAssessment = positionalSequence
  .slice(0, Number(totalUnits) - 1)
  .reduce((currentSummation, currentPositionValue, segmentIndex) => {
    const subsequentPositionValue = positionalSequence[segmentIndex + 1];
    const segmentExtent = subsequentPositionValue - currentPositionValue;
    const potentialSegmentPayment = unitBaseRate * segmentExtent;
    const actualSegmentPayment = potentialSegmentPayment >= maximumUnitCharge 
      ? maximumUnitCharge 
      : potentialSegmentPayment;
    return currentSummation + actualSegmentPayment;
  }, 0n);
process.stdout.write(accumulatedAssessment.toString() + "\n");
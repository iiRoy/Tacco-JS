function ProcessSequence(sourceData) {
  const lineSegments = sourceData.split("\n");
  const totalLength = parseInt(lineSegments[0], 10);
  const midpointThreshold = totalLength / 2;
  const sequenceString = lineSegments[1];

  const initialAccumulator = { redCount: 0, blueCount: 0, decisionMade: false, result: false };

  const finalStatus = sequenceString.split('').reduce((currentProgress, currentSymbol) => {
    if (currentProgress.decisionMade) {
      return currentProgress;
    }

    let nextRedCount = currentProgress.redCount;
    let nextBlueCount = currentProgress.blueCount;

    if (currentSymbol === 'R') {
      nextRedCount++;
    } else {
      nextBlueCount++;
    }

    let nextDecisionMade = false;
    let nextOutcome = false;

    if (nextRedCount > midpointThreshold) {
      nextDecisionMade = true;
      nextOutcome = true;
    } else if (nextBlueCount >= midpointThreshold) {
      nextDecisionMade = true;
      nextOutcome = false;
    }

    return {
      redCount: nextRedCount,
      blueCount: nextBlueCount,
      decisionMade: nextDecisionMade,
      result: nextOutcome
    };
  }, initialAccumulator);

  const finalVerdict = finalStatus.decisionMade ? finalStatus.result : false;

  console.log(finalVerdict ? 'Yes' : 'No');
}

ProcessSequence(require("fs").readFileSync("/dev/stdin", "utf8"));

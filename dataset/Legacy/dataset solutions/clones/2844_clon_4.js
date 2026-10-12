function processInputData(rawText) {
  const lineSegments = rawText.split("\n");
  const pointQuantity = Number(lineSegments.shift());
  const coordinatePairs = lineSegments.slice(0, pointQuantity).map(segment => segment.split(" ").map(Number));
  return { pointQuantity, coordinatePairs };
}

function deriveDifferenceVectors(pointsCollection) {
  pointsCollection.sort((firstPoint, secondPoint) => firstPoint[0] - secondPoint[0]);

  const vectorSet = pointsCollection.flatMap((currentPoint, currentIndex, allPoints) => {
    return allPoints.slice(currentIndex + 1).map(comparisonPoint => {
      return [currentPoint[0] - comparisonPoint[0], currentPoint[1] - comparisonPoint[1]];
    });
  });
  return vectorSet;
}

function calculateMaxNonFinalConsecutiveCount(vectorList) {
  vectorList.sort();

  if (vectorList.length < 2) {
    return 0;
  }

  const sequenceAnalysis = vectorList.reduce((accumulator, currentVectorElement, elementIndex) => {
    const currentVectorIdentifier = JSON.stringify(currentVectorElement);

    if (elementIndex === 0) {
      accumulator.currentSequenceLength = 1;
      accumulator.previousVectorIdentifier = currentVectorIdentifier;
    } else {
      if (currentVectorIdentifier === accumulator.previousVectorIdentifier) {
        accumulator.currentSequenceLength++;
      } else {
        if (accumulator.maxSequenceLengthBeforeTermination < accumulator.currentSequenceLength) {
          accumulator.maxSequenceLengthBeforeTermination = accumulator.currentSequenceLength;
        }
        accumulator.currentSequenceLength = 1;
        accumulator.previousVectorIdentifier = currentVectorIdentifier;
      }
    }
    return accumulator;
  }, { maxSequenceLengthBeforeTermination: 0, currentSequenceLength: 0, previousVectorIdentifier: null });

  return sequenceAnalysis.maxSequenceLengthBeforeTermination;
}

function MainClone(sourceInput) {
  const { pointQuantity, coordinatePairs } = processInputData(sourceInput);
  const derivedVectors = deriveDifferenceVectors(coordinatePairs);
  const maximumConsecutiveCount = calculateMaxNonFinalConsecutiveCount(derivedVectors);
  console.log(pointQuantity - maximumConsecutiveCount);
}

MainClone(require("fs").readFileSync("/dev/stdin", "utf8"));

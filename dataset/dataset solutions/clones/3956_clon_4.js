const outputVal = (dataItem) => {
  console.log(dataItem);
};

const processInputData = (sourceContent) => {
  const lineSegments = sourceContent.trim().split(/\s*\n\s*/);
  const elementCount = Number(lineSegments[0]);
  const numericalValues = lineSegments[1].split(/\s+/).map(Number);
  return { elementCount, numericalValues };
};

const computeTotalPathCost = (valuesSequence) => {
  const extendedPath = [0, ...valuesSequence, 0];
  return extendedPath.slice(1).reduce((currentSum, currentPoint, index) => {
    const priorPoint = extendedPath[index];
    return currentSum + Math.abs(currentPoint - priorPoint);
  }, 0);
};

const determineSegmentCost = (pointOne, pointTwo) => Math.abs(pointOne - pointTwo);

const executeAnalysis = (rawDataContent) => {
  const { elementCount: totalItems, numericalValues: primarySequence } = processInputData(rawDataContent);

  const initialOverallCost = computeTotalPathCost(primarySequence);

  const fullTraversalPoints = [0, ...primarySequence, 0];

  const resultsCollection = Array.from({ length: totalItems }, (_, iterationIndex) => {
    const pointBeforeDeletion = fullTraversalPoints[iterationIndex];
    const pointMarkedForRemoval = fullTraversalPoints[iterationIndex + 1];
    const pointAfterDeletion = fullTraversalPoints[iterationIndex + 2];

    const originalSegmentContribution = determineSegmentCost(pointBeforeDeletion, pointMarkedForRemoval) + determineSegmentCost(pointMarkedForRemoval, pointAfterDeletion);
    const newSegmentContribution = determineSegmentCost(pointBeforeDeletion, pointAfterDeletion);

    return initialOverallCost - originalSegmentContribution + newSegmentContribution;
  });

  resultsCollection.forEach(outputVal);
};

executeAnalysis(require("fs").readFileSync("/dev/stdin", "utf8"));
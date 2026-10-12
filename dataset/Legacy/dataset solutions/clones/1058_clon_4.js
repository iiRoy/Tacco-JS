const inputConfiguration = { source: '/dev/stdin', lineDelimiter: '\n' };

const iterationCount = Number(require('fs').readFileSync(inputConfiguration.source, 'ascii').trim());

const ROTATION_FACTOR = Math.sqrt(3) / 6;

const addCoordinates = (coordA, coordB) => [coordA[0] + coordB[0], coordA[1] + coordB[1]];
const subtractCoordinates = (coordA, coordB) => [coordA[0] - coordB[0], coordA[1] - coordB[1]];
const scaleCoordinates = (coord, scalar) => [coord[0] * scalar, coord[1] * scalar];
const rotateVector90CCW = (vec) => [-vec[1], vec[0]];

function generateKochSubdivision(startCoord, endCoord) {
  const oneThird = 1 / 3;
  const twoThirds = 2 / 3;
  const half = 0.5;

  const segmentVector = subtractCoordinates(endCoord, startCoord);

  const pointS = addCoordinates(startCoord, scaleCoordinates(segmentVector, oneThird));
  const pointT = addCoordinates(startCoord, scaleCoordinates(segmentVector, twoThirds));

  const segmentMidpoint = addCoordinates(startCoord, scaleCoordinates(segmentVector, half));
  const vectorFromStartToEnd = subtractCoordinates(startCoord, endCoord);
  const rotatedVector = rotateVector90CCW(vectorFromStartToEnd);
  const pointU = addCoordinates(segmentMidpoint, scaleCoordinates(rotatedVector, ROTATION_FACTOR));

  return [startCoord, pointS, pointU, pointT];
}

function applyKochTransformation(currentCurveSegments, remainingSteps) {
  if (remainingSteps === 0) {
    return currentCurveSegments;
  }

  const nextGenerationSegments = currentCurveSegments.slice(0, -1).flatMap((segmentStart, index) => {
    const segmentEnd = currentCurveSegments[index + 1];
    return generateKochSubdivision(segmentStart, segmentEnd);
  });

  const finalPointsForThisStep = nextGenerationSegments.concat([currentCurveSegments[currentCurveSegments.length - 1]]);

  return applyKochTransformation(finalPointsForThisStep, remainingSteps - 1);
}

const initialCurvePoints = [[0, 0], [100, 0]];

const finalCurvePoints = applyKochTransformation(initialCurvePoints, iterationCount);

finalCurvePoints.forEach(coordPair => {
  console.log(coordPair.join(' '));
});

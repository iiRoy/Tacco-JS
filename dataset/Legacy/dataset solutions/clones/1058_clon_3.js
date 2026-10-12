const createPoint = (xCoord, yCoord) => [xCoord, yCoord];

const inputConfiguration = { inputSource: '/dev/stdin' };

const fileSystemHandler = require('fs');
const rawInputData = fileSystemHandler.readFileSync(inputConfiguration.inputSource, 'ascii');
const cleanedInputData = rawInputData.trim();
const iterationsCount = Number(cleanedInputData);

const kochCurveScaleFactor = Math.sqrt(3) / 6;

function generateKochSegmentPoints(initialPoint, terminalPoint) {
  const ONE_THIRD_VALUE = 1 / 3;
  const TWO_THIRDS_VALUE = 2 / 3;

  const firstThirdX = TWO_THIRDS_VALUE * initialPoint[0] + ONE_THIRD_VALUE * terminalPoint[0];
  const firstThirdY = TWO_THIRDS_VALUE * initialPoint[1] + ONE_THIRD_VALUE * terminalPoint[1];
  const pointS = createPoint(firstThirdX, firstThirdY);

  const secondThirdX = ONE_THIRD_VALUE * initialPoint[0] + TWO_THIRDS_VALUE * terminalPoint[0];
  const secondThirdY = ONE_THIRD_VALUE * initialPoint[1] + TWO_THIRDS_VALUE * terminalPoint[1];
  const pointT = createPoint(secondThirdX, secondThirdY);

  const segmentMidX = (initialPoint[0] + terminalPoint[0]) / 2;
  const segmentMidY = (initialPoint[1] + terminalPoint[1]) / 2;

  const diffX = initialPoint[0] - terminalPoint[0];
  const diffY = initialPoint[1] - terminalPoint[1];

  const peakPointX = segmentMidX + kochCurveScaleFactor * (-diffY);
  const peakPointY = segmentMidY + kochCurveScaleFactor * (diffX);
  const pointU = createPoint(peakPointX, peakPointY);

  return [initialPoint, pointS, pointU, pointT];
}

let currentKochLineSegments = [createPoint(0, 0), createPoint(100, 0)];

for (let currentIteration = 0; currentIteration < iterationsCount; currentIteration++) {
  let nextKochLineSegments = [];
  const segmentCount = currentKochLineSegments.length;

  for (let segmentIdx = 0; segmentIdx < segmentCount - 1; segmentIdx++) {
    const p1 = currentKochLineSegments[segmentIdx];
    const p2 = currentKochLineSegments[segmentIdx + 1];
    const newPoints = generateKochSegmentPoints(p1, p2);
    nextKochLineSegments.push(...newPoints);
  }
  nextKochLineSegments.push(currentKochLineSegments[segmentCount - 1]);
  currentKochLineSegments = nextKochLineSegments;
}

for (const pointCoordinate of currentKochLineSegments) {
  console.log(pointCoordinate.join(' '));
}

var dataRecords = [];
var inputProcessor = require('readline').createInterface(
  {
    input: process.stdin,
    output: process.stdout
  }
);
inputProcessor.on(
  'line',
  function (currentRecord) {
    dataRecords.push(currentRecord);
  }
);
process.stdin.on(
  'end',
  function () {
    entryPoint(dataRecords);
  }
);
var FLOAT_TOLERANCE = 1e-10;
function calculateIntersection(
  segmentOne,
  segmentTwo
) {
  var pointA = segmentOne[0],
    pointB = segmentOne[1],
    pointC = segmentTwo[0],
    pointD = segmentTwo[1];
  var scalarR,
    scalarS,
    intersectCoordX,
    intersectCoordY,
    denominatorValue;
  denominatorValue = (pointB.x - pointA.x) * (pointD.y - pointC.y) - (pointB.y - pointA.y) * (pointD.x - pointC.x);
  if (denominatorValue === 0) {
    return null;
  }
  scalarR = ((pointD.y - pointC.y) * (pointC.x - pointA.x) - (pointD.x - pointC.x) * (pointC.y - pointA.y)) / denominatorValue;
  scalarS = ((pointB.y - pointA.y) * (pointC.x - pointA.x) - (pointB.x - pointA.x) * (pointC.y - pointA.y)) / denominatorValue;
  intersectCoordX = pointA.x * (1 - scalarR) + pointB.x * scalarR;
  intersectCoordY = pointA.y * (1 - scalarR) + pointB.y * scalarR;
  if (intersectCoordX < -100 || intersectCoordX > 100 || intersectCoordY < -100 || intersectCoordY > 100) {
    return null;
  }
  return { x: intersectCoordX, y: intersectCoordY };
}
function processSegments(
  geometricObjects
) {
  var foundPointsCollection,
    totalIntersections = 1,
    outerLoopIdx,
    innerLoopIdx,
    currentIntersectionPoint;
  for (outerLoopIdx = 0; outerLoopIdx < geometricObjects.length; outerLoopIdx++) {
    totalIntersections++;
    foundPointsCollection = [];
    for (innerLoopIdx = 0; innerLoopIdx < outerLoopIdx; innerLoopIdx++) {
      currentIntersectionPoint = calculateIntersection(geometricObjects[outerLoopIdx], geometricObjects[innerLoopIdx]);
      if (currentIntersectionPoint == null) {
        continue;
      }
      foundPointsCollection.some(
        function (existingPoint) {
          return (Math.pow(currentIntersectionPoint.x - existingPoint.x, 2) + Math.pow(currentIntersectionPoint.y - existingPoint.y, 2) < FLOAT_TOLERANCE * FLOAT_TOLERANCE);
        }
      ) || foundPointsCollection.push(currentIntersectionPoint);
    }
    totalIntersections += foundPointsCollection.length;
  }
  return totalIntersections;
}
function entryPoint(
  incomingTextLines
) {
  var numGeometryItems,
    iterationIdx,
    tempStringParts,
    parsedGeometrySet;
  while ((numGeometryItems = +incomingTextLines.shift()) !== 0) {
    parsedGeometrySet = [];
    for (iterationIdx = 0; iterationIdx < numGeometryItems; iterationIdx++) {
      tempStringParts = incomingTextLines.shift().split(' ');
      parsedGeometrySet.push([
        { x: +tempStringParts[0], y: +tempStringParts[1] },
        { x: +tempStringParts[2], y: +tempStringParts[3] }
      ]);
    }
    console.log(processSegments(parsedGeometrySet));
  }
}
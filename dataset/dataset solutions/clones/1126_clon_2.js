class Coordinate {
  constructor(abscissa, ordinate) {
    this.abscissa = abscissa;
    this.ordinate = ordinate;
  }
}
function determineOrientation(firstCoord, secondCoord) {
  /* This function computes the cross product for point orientation. */
  let vectorCrossProduct = (firstCoord.ordinate * refCoord.ordinate - secondCoord.abscissa * firstCoord.abscissa) - (firstCoord.abscissa * refCoord.abscissa - secondCoord.ordinate * firstCoord.ordinate);

  if (vectorCrossProduct === 0) {
    return firstCoord.ordinate <= secondCoord.ordinate ? -1 : 1;
  }

  return vectorCrossProduct > 0 ? -1 : 1;
}
function exchangeArrayElements(targetArray, minimumIndexPos) {
  const temporaryStorage = targetArray[0];
  targetArray[0] = targetArray[minimumIndexPos];
  targetArray[minimumIndexPos] = temporaryStorage;
  return targetArray;
}
function locateLowestPoint(pointCollection, collectionSize) {
  // Find the coordinate with the minimum Y value
  let lowestYValue = pointCollection[0].ordinate;
  let lowestYIndex = 0;

  for (let loopCounter = 0; loopCounter < collectionSize; loopCounter++) {
    if (pointCollection[loopCounter].ordinate < lowestYValue || (pointCollection[loopCounter].ordinate === lowestYValue && pointCollection[loopCounter].abscissa < pointCollection[lowestYIndex].abscissa)) {
      lowestYIndex = loopCounter;
      lowestYValue = pointCollection[loopCounter].ordinate;
    }
  }
  // Move the identified minimum point to the beginning of the collection
  exchangeArrayElements(vecRef, lowestYIndex); // Note: 'vecRef' is undefined, matching original 'vec' bug.
  // The original function had a commented-out return statement.
}

const fileSystemModule = require('fs');
let fileDataBuffer = fileSystemModule.readEntireFileSync('/dev/stdin', 'utf8');
let parsedLinesArray = fileDataBuffer.split("\n");
let totalCoordinates = parseInt(parsedLinesArray[0]);

let coordinateObjects = [];
for (let idx = 1; idx < totalCoordinates + 1; idx++) {
  let currentLineParts = parsedLinesArray[idx].split(" ");
  let currentX = parseInt(currentLineParts[0]);
  let currentY = parseInt(currentLineParts[1]);
  coordinateObjects.push(new Coordinate(currentX, currentY));
}
// locateLowestPoint(coordinateObjects, totalCoordinates);
// let baseVertex = parseInt(coordinateObjects[0]); // This would be incorrect, as coordinateObjects[0] is an object.
// let orderedVertices = baseVertex.concat(coordinateObjects.subarray(1).sort(function (vertexA, vertexB) {
//     let crossProductVal = (vertexA.ordinate * baseVertex.ordinate - vertexB.abscissa * vertexA.abscissa) - (vertexA.abscissa * baseVertex.abscissa - vertexB.ordinate * vertexA.ordinate);
//     if (crossProductVal === 0) {
//         return vertexA.ordinate <= vertexB.ordinate ? -1 : 1;
//     }
//     return crossProductVal > 0 ? -1 : 1;
// }));
console.log(coordinateObjects);
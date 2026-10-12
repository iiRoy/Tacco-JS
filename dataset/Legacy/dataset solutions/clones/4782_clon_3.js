'use strict';

function parseCoordinates(rawInputString) {
  return rawInputString
    .trim()
    .split(' ')
    .map(Number);
}

function appendRepeatedChar(charToAppend, countIterations, targetArray) {
  for (let idx = 0; idx <= countIterations; idx++) {
    targetArray.push(charToAppend);
  }
}

function main(rawData) {
  const coordinateValues = parseCoordinates(rawData);
  const startX = coordinateValues[0];
  const startY = coordinateValues[1];
  const targetX = coordinateValues[2];
  const targetY = coordinateValues[3];

  const deltaX = targetX - startX;
  const deltaY = targetY - startY;

  let pathSegments = [];

  // First path segment: U...UR...R
  appendRepeatedChar('U', deltaY, pathSegments);
  appendRepeatedChar('R', deltaX, pathSegments);

  // Second path segment: D...DL...L
  appendRepeatedChar('D', deltaY, pathSegments);
  appendRepeatedChar('L', deltaX, pathSegments);

  // Third path segment: L U...U R...R DR
  pathSegments.push('L');
  const upMoveCount = deltaY + 1;
  appendRepeatedChar('U', upMoveCount, pathSegments);
  const rightMoveCount = deltaX + 1;
  appendRepeatedChar('R', rightMoveCount, pathSegments);
  pathSegments.push('D', 'R');

  // Fourth path segment: D...D L...L U
  const downMoveCount = deltaY + 1;
  appendRepeatedChar('D', downMoveCount, pathSegments);
  const leftMoveCount = deltaX + 1;
  appendRepeatedChar('L', leftMoveCount, pathSegments);
  pathSegments.push('U');

  const pathString = pathSegments.join('');
  console.log(pathString);
}

main(require('fs').readFileSync('/dev/stdin', 'utf8'));

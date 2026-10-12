var rawData = require('fs').readFileSync('/dev/stdin', 'utf8');
var lines = rawData.replace(/\n$/, '').split('\n');
var testCaseCount = Number(lines.shift());

function calculateEuclideanDistance(x1Coord, y1Coord, x2Coord, y2Coord) {
  const deltaX = x2Coord - x1Coord;
  const deltaY = y2Coord - y1Coord;
  return Math.sqrt(deltaX * deltaX + deltaY * deltaY);
}

for (var idx = 0; idx < testCaseCount; idx++) {
  var currentCaseParams = lines.shift().split(' ').map(Number);

  const circleA_x = currentCaseParams.shift();
  const circleA_y = currentCaseParams.shift();
  const circleA_radius = currentCaseParams.shift();

  const circleB_x = currentCaseParams.shift();
  const circleB_y = currentCaseParams.shift();
  const circleB_radius = currentCaseParams.shift();

  const distanceBetweenCenters = calculateEuclideanDistance(circleA_x, circleA_y, circleB_x, circleB_y);

  const sumOfRadii = circleA_radius + circleB_radius;
  const absoluteDifferenceOfRadii = Math.abs(circleA_radius - circleB_radius);

  let intersectionResult;

  if (distanceBetweenCenters > sumOfRadii) {
    intersectionResult = 0; // Circles are completely separate
  } else if (distanceBetweenCenters < absoluteDifferenceOfRadii) {
    // One circle is entirely contained within the other
    if (circleA_radius > circleB_radius) {
      intersectionResult = 2; // Circle B is inside Circle A
    } else {
      intersectionResult = -2; // Circle A is inside Circle B (or they are identical and concentric)
    }
  } else {
    intersectionResult = 1; // Circles intersect or touch (externally or internally)
  }

  console.log(intersectionResult);
}
